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
    await admin.query("savepoint family_create_check");
    try {
        await admin.query(sql, params);
    } catch (error) {
        await admin.query("rollback to savepoint family_create_check");
        expect(error instanceof Error ? error.message : String(error)).toContain(
            code,
        );
        return;
    }
    await admin.query("rollback to savepoint family_create_check");
    throw new Error(`${code} で拒否される`);
}

/**
 * 確認済みのユーザーを作る。
 * @param email メールアドレス
 * @returns ユーザー ID
 */
async function insertUser(email: string): Promise<string> {
    const id = randomUUID();
    await admin.query(
        `insert into auth.users (
            id, aud, role, email, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data
        ) values (
            $1, 'authenticated', 'authenticated', $2, now(),
            '{"provider":"email","providers":["email"]}', '{}'
        )`,
        [id, email],
    );
    return id;
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

describe("create_family on the local database", () => {
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

    it("未ログインと直 INSERT は拒否し、未所属のゲストは本人をオーナーにして1件作る", async () => {
        await scenario(async () => {
            await admin.query("set local role authenticated");
            await expectSqlError(`select create_family('無名家')`, [], "UNAUTHENTICATED");
            await resetRole();

            const userId = await insertUser(`guest-${randomUUID()}@example.com`);
            await setUser(userId, true);
            await expectSqlError(
                `insert into families (name, owner_id) values ('直挿入', $1)`,
                [userId],
                "row-level security",
            );

            const created = await admin.query(
                `select create_family('ゲスト家') as id`,
            );
            const familyId = created.rows[0].id as string;
            await resetRole();

            const family = await admin.query(
                `select owner_id from families where id = $1`,
                [familyId],
            );
            const members = await admin.query(
                `select user_id from family_members where family_id = $1`,
                [familyId],
            );
            expect(family.rows[0].owner_id).toBe(userId);
            expect(members.rows.map((row) => row.user_id)).toEqual([userId]);

            await setUser(userId, true);
            await expectSqlError(
                `select create_family('2件目')`,
                [],
                "ALREADY_IN_FAMILY",
            );
        });
    });

    it("同時の作成は1件だけ残る", async () => {
        const userId = await insertUser(`race-${randomUUID()}@example.com`);
        const claims = JSON.stringify({
            sub: userId,
            role: "authenticated",
            is_anonymous: false,
        });

        /**
         * 別接続で家族を作る。
         * @returns 成功なら true
         */
        const create = async (): Promise<boolean> => {
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
                    [userId],
                );
                await client.query("set local role authenticated");
                await client.query(`select create_family('同時家')`);
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
            const results = await Promise.all([create(), create()]);
            expect(results.filter(Boolean)).toHaveLength(1);
            const members = await admin.query(
                `select count(*)::int as count from family_members where user_id = $1`,
                [userId],
            );
            expect(members.rows[0].count).toBe(1);
        } finally {
            await admin.query(
                `delete from families where owner_id = $1`,
                [userId],
            );
            await admin.query(`delete from auth.users where id = $1`, [userId]);
        }
    });
});
