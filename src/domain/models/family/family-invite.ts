/**
 * オーナーが見る、期限内で未使用の招待。
 */
export type FamilyInviteSummary = {
    id: string;
    invitedEmail: string;
    expiresAt: Date;
};

/**
 * 宛先本人が見る招待。家族名以外の家族情報は持たない。
 */
export type MyFamilyInvite = {
    id: string;
    familyName: string;
    expiresAt: Date;
};

/**
 * 一覧の絞り込み前にリポジトリが返す招待。
 */
export type FamilyInviteRecord = FamilyInviteSummary & {
    revokedAt: Date | null;
    usedAt: Date | null;
};
