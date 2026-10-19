import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import pg from "pg";

const databaseUrl =
    process.env.FAMILY_INVITE_DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let admin: pg.Client;

/**
 * 失敗コードがメッセージに含まれるまで、セーブポイントへ戻す。
 * @param sql 実行する SQL
 * @param params パラメータ
 * @param code 期待する失敗コード
 */
async function expectSqlError(
    sql: string,
    params: unknown[],
    code: string,
): Promise<void> {
    await admin.query("savepoint invite_check");
    try {
        await admin.query(sql, params);
    } catch (error) {
        await admin.query("rollback to savepoint invite_check");
        expect(error instanceof Error ? error.message : String(error)).toContain(
            code,
        );
        return;
    }
    await admin.query("rollback to savepoint invite_check");
    throw new Error(`${code} で拒否される`);
}

/**
 * 確認済みのユーザーを作る。
 * @param email メールアドレス
 * @param confirmed メール確認済みにするか
 * @returns ユーザー ID
 */
async function insertUser(email: string, confirmed = true): Promise<string> {
    const id = randomUUID();
    await admin.query(
        `insert into auth.users (
            id, aud, role, email, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data
        ) values (
            $1, 'authenticated', 'authenticated', $2, $3,
            '{"provider":"email","providers":["email"]}', '{}'
        )`,
        [id, email, confirmed ? new Date() : null],
    );
    return id;
}

/**
 * 家族とオーナー所属を作る。
 * @param ownerId オーナー
 * @returns 家族 ID
 */
async function insertFamily(ownerId: string): Promise<string> {
    const familyId = randomUUID();
    await admin.query(
        `insert into families (id, name, owner_id) values ($1, 'テスト家', $2)`,
        [familyId, ownerId],
    );
    await admin.query(
        `insert into family_members (family_id, user_id) values ($1, $2)`,
        [familyId, ownerId],
    );
    return familyId;
}

/**
 * 以降の文を、そのユーザーの JWT と authenticated で実行する。
 * @param userId ユーザー ID
 * @param anonymous ゲストの JWT にするか
 */
async function setUser(userId: string, anonymous: boolean): Promise<void> {
    const claims = JSON.stringify({
        sub: userId,
        role: "authenticated",
        is_anonymous: anonymous,
    });
    await admin.query(`select set_config('request.jwt.claims', $1, true)`, [
        claims,
    ]);
    await admin.query(`select set_config('request.jwt.claim.sub', $1, true)`, [
        userId,
    ]);
    await admin.query("set local role authenticated");
}

/**
 * スーパーユーザーに戻す。
 */
async function resetRole(): Promise<void> {
    await admin.query("reset role");
}

/**
 * 1 トランザクションで実行し、終わったら戻す。
 * @param run テスト本体
 */
async function scenario(run: () => Promise<void>): Promise<void> {
    await admin.query("begin");
    try {
        await run();
        await admin.query("rollback");
    } catch (error) {
        await admin.query("rollback");
        throw error;
    }
}

describe("family invites on the local database", () => {
    beforeAll(async () => {
        admin = new pg.Client({
            connectionString: databaseUrl,
            connectionTimeoutMillis: 3000,
        });
        await admin.connect();
    });

    afterAll(async () => {
        await admin.end();
    });

    it("authenticated は招待を直接 INSERT / UPDATE できない", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const familyId = await insertFamily(ownerId);
            await setUser(ownerId, false);

            await expectSqlError(
                `insert into family_invites (family_id, invited_email, created_by, expires_at)
                 values ($1, 'a@example.com', $2, now() + interval '1 day')`,
                [familyId, ownerId],
                "permission denied",
            );
            await resetRole();
            const created = await admin.query(
                `insert into family_invites (family_id, invited_email, created_by, expires_at)
                 values ($1, 'a@example.com', $2, now() + interval '1 day')
                 returning id`,
                [familyId, ownerId],
            );
            await setUser(ownerId, false);
            await expectSqlError(
                `update family_invites set invited_email = 'b@example.com' where id = $1`,
                [created.rows[0].id],
                "permission denied",
            );
        });
    });

    it("発行の期限は 1 日で、ゲストとオーナー以外は関数でも拒否される", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const otherId = await insertUser(`other-${randomUUID()}@example.com`);
            const familyId = await insertFamily(ownerId);

            await setUser(ownerId, true);
            await expectSqlError(
                `select create_family_invite($1, $2)`,
                [familyId, "guest@example.com"],
                "GUEST_NOT_ALLOWED",
            );

            await resetRole();
            await setUser(otherId, false);
            await expectSqlError(
                `select create_family_invite($1, $2)`,
                [familyId, "a@example.com"],
                "NOT_OWNER",
            );

            await resetRole();
            await setUser(ownerId, false);
            const created = await admin.query(
                `select create_family_invite($1, $2) as id`,
                [familyId, "  A@Example.com "],
            );
            await resetRole();
            const row = await admin.query(
                `select invited_email, expires_at from family_invites where id = $1`,
                [created.rows[0].id],
            );
            expect(row.rows[0].invited_email).toBe("a@example.com");
            const expiresAt = new Date(row.rows[0].expires_at).getTime();
            const now = Date.now();
            expect(expiresAt).toBeGreaterThan(now + 23 * 60 * 60 * 1000);
            expect(expiresAt).toBeLessThan(now + 25 * 60 * 60 * 1000);

            await setUser(ownerId, false);
            await expectSqlError(
                `select create_family_invite($1, $2)`,
                [familyId, "a@example.com"],
                "DUPLICATE_ACTIVE_INVITE",
            );
        });
    });

    it("宛先が違う承認は所属を増やさない", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const otherId = await insertUser(`other-${randomUUID()}@example.com`);
            const familyId = await insertFamily(ownerId);
            await setUser(ownerId, false);
            const created = await admin.query(
                `select create_family_invite($1, $2) as id`,
                [familyId, "invitee@example.com"],
            );
            await resetRole();
            await setUser(otherId, false);
            await expectSqlError(
                `select approve_family_invite($1)`,
                [created.rows[0].id],
                "INVITE_NOT_USABLE",
            );
            await resetRole();
            const members = await admin.query(
                `select count(*)::int as count from family_members where user_id = $1`,
                [otherId],
            );
            expect(members.rows[0].count).toBe(0);
        });
    });

    it("6 人を超える承認は所属を増やさない", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const familyId = await insertFamily(ownerId);
            for (let index = 0; index < 5; index += 1) {
                const memberId = await insertUser(
                    `member-${index}-${randomUUID()}@example.com`,
                );
                await admin.query(
                    `insert into family_members (family_id, user_id) values ($1, $2)`,
                    [familyId, memberId],
                );
            }
            const inviteeEmail = `invitee-${randomUUID()}@example.com`;
            const inviteeId = await insertUser(inviteeEmail);
            await setUser(ownerId, false);
            const created = await admin.query(
                `select create_family_invite($1, $2) as id`,
                [familyId, inviteeEmail],
            );
            await resetRole();
            await setUser(inviteeId, false);
            await expectSqlError(
                `select approve_family_invite($1)`,
                [created.rows[0].id],
                "FAMILY_MEMBER_LIMIT",
            );
            await resetRole();
            const members = await admin.query(
                `select count(*)::int as count from family_members where family_id = $1`,
                [familyId],
            );
            expect(members.rows[0].count).toBe(6);
        });
    });

    it("使用済みの招待は取り消せず、所属は残る", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const inviteeEmail = `invitee-${randomUUID()}@example.com`;
            const inviteeId = await insertUser(inviteeEmail);
            const familyId = await insertFamily(ownerId);
            await setUser(ownerId, false);
            const created = await admin.query(
                `select create_family_invite($1, $2) as id`,
                [familyId, inviteeEmail],
            );
            await resetRole();
            await setUser(inviteeId, false);
            await admin.query(`select approve_family_invite($1)`, [
                created.rows[0].id,
            ]);
            await resetRole();
            await setUser(ownerId, false);
            await expectSqlError(
                `select cancel_family_invite($1)`,
                [created.rows[0].id],
                "INVITE_ALREADY_USED",
            );
            await resetRole();
            const row = await admin.query(
                `select revoked_at from family_invites where id = $1`,
                [created.rows[0].id],
            );
            const members = await admin.query(
                `select count(*)::int as count from family_members where user_id = $1`,
                [inviteeId],
            );
            expect(row.rows[0].revoked_at).toBeNull();
            expect(members.rows[0].count).toBe(1);
        });
    });

    it("同時の承認では所属が 1 件だけ増える", async () => {
        const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
        const inviteeEmail = `invitee-${randomUUID()}@example.com`;
        const inviteeId = await insertUser(inviteeEmail);
        const familyId = await insertFamily(ownerId);
        await admin.query("begin");
        await setUser(ownerId, false);
        const created = await admin.query(
            `select create_family_invite($1, $2) as id`,
            [familyId, inviteeEmail],
        );
        await admin.query("commit");

        const inviteId = created.rows[0].id as string;
        const claims = JSON.stringify({
            sub: inviteeId,
            role: "authenticated",
            is_anonymous: false,
        });

        /**
         * 別接続で同じ招待を承認する。
         * @returns 成功なら true
         */
        const approve = async (): Promise<boolean> => {
            const client = new pg.Client({
                connectionString: databaseUrl,
                connectionTimeoutMillis: 3000,
            });
            await client.connect();
            try {
                await client.query("begin");
                await client.query(
                    `select set_config('request.jwt.claims', $1, true)`,
                    [claims],
                );
                await client.query(
                    `select set_config('request.jwt.claim.sub', $1, true)`,
                    [inviteeId],
                );
                await client.query("set local role authenticated");
                await client.query(`select approve_family_invite($1)`, [inviteId]);
                await client.query("commit");
                return true;
            } catch {
                await client.query("rollback");
                return false;
            } finally {
                await client.end();
            }
        };

        try {
            const results = await Promise.all([approve(), approve()]);
            expect(results.filter(Boolean)).toHaveLength(1);
            const members = await admin.query(
                `select count(*)::int as count from family_members where user_id = $1`,
                [inviteeId],
            );
            expect(members.rows[0].count).toBe(1);
        } finally {
            await admin.query(`delete from families where id = $1`, [familyId]);
            await admin.query(`delete from auth.users where id = any($1::uuid[])`, [
                [ownerId, inviteeId],
            ]);
        }
    });

    it("オーナー本人は家族作成と同じく自分を所属させられる", async () => {
        await scenario(async () => {
            const ownerId = await insertUser(`owner-${randomUUID()}@example.com`);
            const familyId = randomUUID();
            await admin.query(
                `insert into families (id, name, owner_id) values ($1, '作成家', $2)`,
                [familyId, ownerId],
            );
            await setUser(ownerId, false);
            await admin.query(
                `insert into family_members (family_id, user_id) values ($1, $2)`,
                [familyId, ownerId],
            );
            await resetRole();
            const members = await admin.query(
                `select count(*)::int as count from family_members where family_id = $1`,
                [familyId],
            );
            expect(members.rows[0].count).toBe(1);
        });
    });
});
