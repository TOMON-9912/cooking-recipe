import type {
    FamilyInviteRecord,
    FamilyInviteSummary,
} from "@/domain/models/family/family-invite";
import { createAuthedClient } from "@/lib/supabase/server";
import {
    FamilyInviteErrorCode,
    familyInviteError,
    type FamilyInviteErrorCode as FamilyInviteErrorCodeValue,
} from "@/domain/models/family/family-invite-error";

type FamilyInviteRow = {
    id: string;
    invited_email: string;
    expires_at: string;
    revoked_at: string | null;
    used_at: string | null;
};

type MyFamilyInviteRow = {
    id: string;
    family_name: string;
    expires_at: string;
};

const INVITE_CODES = Object.values(FamilyInviteErrorCode);

/**
 * PostgREST の失敗を招待の失敗コードへ揃える。
 * @param error クライアントが返した失敗
 */
function throwMappedInviteError(error: {
    message: string;
    details?: string | null;
}): never {
    const text = `${error.message} ${error.details ?? ""}`;
    const code = INVITE_CODES.find((item) => text.includes(item));
    if (code) {
        throw familyInviteError(code as FamilyInviteErrorCodeValue);
    }
    if (text.includes("UNAUTHENTICATED")) {
        throw new Error("UNAUTHENTICATED");
    }
    throw new Error(error.message);
}

/**
 * 行を招待レコードへ変換する。
 * @param row 招待の行
 * @returns ドメインの招待
 */
function mapInviteRow(row: FamilyInviteRow): FamilyInviteRecord {
    return {
        id: row.id,
        invitedEmail: row.invited_email,
        expiresAt: new Date(row.expires_at),
        revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
        usedAt: row.used_at ? new Date(row.used_at) : null,
    };
}

/**
 * JWT の is_anonymous から本登録かどうかを返す。
 * @returns 本登録なら true
 */
export async function isPermanentUser(): Promise<boolean> {
    const { supabase } = await createAuthedClient();
    const { data, error } = await supabase.rpc("is_permanent_user");
    if (error) throwMappedInviteError(error);
    return data === true;
}

/**
 * ログイン中のユーザーがその家族のオーナーかを返す。
 * @param familyId 家族 ID
 * @returns オーナーなら true
 */
export async function isOwnerOfFamily(familyId: string): Promise<boolean> {
    const { supabase, user } = await createAuthedClient();
    const { data, error } = await supabase
        .from("families")
        .select("id")
        .eq("id", familyId)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (error) throw error;
    return data !== null;
}

/**
 * 招待を発行する。期限と重ね発行の拒否は DB 関数が行う。
 * @param familyId 家族 ID
 * @param invitedEmail 正規化済みの宛先
 * @returns 発行した招待
 */
export async function createFamilyInvite(
    familyId: string,
    invitedEmail: string,
): Promise<FamilyInviteSummary> {
    const { supabase } = await createAuthedClient();
    const { data, error } = await supabase.rpc("create_family_invite", {
        p_family_id: familyId,
        p_invited_email: invitedEmail,
    });

    if (error) throwMappedInviteError(error);

    const created = await supabase
        .from("family_invites")
        .select("id, invited_email, expires_at, revoked_at, used_at")
        .eq("id", data as string)
        .single();

    if (created.error) throwMappedInviteError(created.error);
    return mapInviteRow(created.data as FamilyInviteRow);
}

/**
 * オーナーが見える招待を返す。期限内未使用の絞り込みは usecase が行う。
 * @param familyId 家族 ID
 * @returns 招待の一覧
 */
export async function findFamilyInvitesByFamilyId(
    familyId: string,
): Promise<FamilyInviteRecord[]> {
    const { supabase } = await createAuthedClient();
    const { data, error } = await supabase
        .from("family_invites")
        .select("id, invited_email, expires_at, revoked_at, used_at")
        .eq("family_id", familyId);

    if (error) throw error;
    return (data as FamilyInviteRow[]).map(mapInviteRow);
}

/**
 * 未使用の招待を取り消す。
 * @param inviteId 招待 ID
 */
export async function cancelFamilyInvite(inviteId: string): Promise<void> {
    const { supabase } = await createAuthedClient();
    const { error } = await supabase.rpc("cancel_family_invite", {
        p_invite_id: inviteId,
    });
    if (error) throwMappedInviteError(error);
}

/**
 * ログイン中のメール宛ての有効な招待を返す。
 * @returns 招待 ID、家族名、期限
 */
export async function listMyFamilyInvites(): Promise<
    { id: string; familyName: string; expiresAt: Date }[]
> {
    const { supabase } = await createAuthedClient();
    const { data, error } = await supabase.rpc("list_my_family_invites");
    if (error) throwMappedInviteError(error);

    return ((data ?? []) as MyFamilyInviteRow[]).map((row) => ({
        id: row.id,
        familyName: row.family_name,
        expiresAt: new Date(row.expires_at),
    }));
}

/**
 * 招待を承認し、所属と使用済み化を同じ関数で行う。
 * @param inviteId 招待 ID
 */
export async function approveFamilyInvite(inviteId: string): Promise<void> {
    const { supabase } = await createAuthedClient();
    const { error } = await supabase.rpc("approve_family_invite", {
        p_invite_id: inviteId,
    });
    if (error) throwMappedInviteError(error);
}
