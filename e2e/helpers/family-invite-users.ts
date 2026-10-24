import { randomUUID } from "node:crypto";
import pg from "pg";

const databaseUrl =
    process.env.FAMILY_INVITE_DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const instanceId = "00000000-0000-0000-0000-000000000000";

export type SeededFamilyUser = {
    id: string;
    email: string;
    password: string;
};

/**
 * 確認済みのメールユーザーを作り、画面からログインできるようにする。
 * @param email メールアドレス
 * @param password パスワード
 * @returns 作ったユーザー
 */
async function insertLoginUser(
    email: string,
    password: string,
): Promise<SeededFamilyUser> {
    const id = randomUUID();
    const client = new pg.Client({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000,
    });
    await client.connect();
    try {
        await client.query(
            `insert into auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data,
                confirmation_token, recovery_token, email_change_token_new, email_change,
                created_at, updated_at
            ) values (
                $1::uuid, $2::uuid, 'authenticated', 'authenticated', $3,
                extensions.crypt($4, extensions.gen_salt('bf')), now(),
                '{"provider":"email","providers":["email"]}', '{}',
                '', '', '', '',
                now(), now()
            )`,
            [instanceId, id, email, password],
        );
        await client.query(
            `insert into auth.identities (
                id, user_id, identity_data, provider, provider_id,
                created_at, updated_at, last_sign_in_at
            ) values (
                $1::uuid, $1::uuid, $2::jsonb, 'email', $3, now(), now(), now()
            )`,
            [
                id,
                JSON.stringify({ sub: id, email, email_verified: true }),
                id,
            ],
        );
    } finally {
        await client.end();
    }
    return { id, email, password };
}

/**
 * 招待の e2e で使うオーナーと宛先を作る。
 * @returns 2 人のログイン情報
 */
export async function seedFamilyInviteUsers(): Promise<{
    owner: SeededFamilyUser;
    invitee: SeededFamilyUser;
}> {
    const suffix = randomUUID();
    const password = "family-invite-e2e-pass";
    const owner = await insertLoginUser(
        `owner-${suffix}@example.com`,
        password,
    );
    const invitee = await insertLoginUser(
        `invitee-${suffix}@example.com`,
        password,
    );
    return { owner, invitee };
}

/**
 * e2e で作ったユーザーと、その家族を消す。
 * @param users 削除するユーザー
 */
export async function deleteFamilyInviteUsers(
    users: SeededFamilyUser[],
): Promise<void> {
    const ids = users.map((user) => user.id);
    const client = new pg.Client({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000,
    });
    await client.connect();
    try {
        await client.query(
            `delete from families where owner_id = any($1::uuid[])`,
            [ids],
        );
        await client.query(
            `delete from auth.identities where user_id = any($1::uuid[])`,
            [ids],
        );
        await client.query(`delete from auth.users where id = any($1::uuid[])`, [
            ids,
        ]);
    } finally {
        await client.end();
    }
}
