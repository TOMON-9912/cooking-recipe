import {
    FamilyInviteErrorCode,
    familyInviteError,
} from "./family-invite-errors";

/**
 * 招待の発行・一覧・取り消しに共通する操作者。
 */
export type FamilyInviteActorDeps = {
    isPermanentUser: () => Promise<boolean>;
    isOwnerOfFamily: (familyId: string) => Promise<boolean>;
};

/**
 * 宛先メールを比較・保存の前に揃える。空や形式が違うときは失敗する。
 * @param email 入力されたメールアドレス
 * @returns trim して小文字にしたメールアドレス
 */
export function normalizeInviteEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        throw familyInviteError(FamilyInviteErrorCode.INVALID_EMAIL);
    }
    return normalized;
}

/**
 * 本登録ユーザーであることを確かめる。ゲストは招待を扱えない。
 * @param deps 操作者の判定
 */
export async function assertPermanentUser(
    deps: Pick<FamilyInviteActorDeps, "isPermanentUser">,
): Promise<void> {
    if (!(await deps.isPermanentUser())) {
        throw familyInviteError(FamilyInviteErrorCode.GUEST_NOT_ALLOWED);
    }
}

/**
 * その家族のオーナーかつ本登録ユーザーであることを確かめる。
 * @param familyId 対象の家族
 * @param deps 操作者の判定
 */
export async function assertOwner(
    familyId: string,
    deps: FamilyInviteActorDeps,
): Promise<void> {
    await assertPermanentUser(deps);
    if (!(await deps.isOwnerOfFamily(familyId))) {
        throw familyInviteError(FamilyInviteErrorCode.NOT_OWNER);
    }
}
