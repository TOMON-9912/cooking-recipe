/**
 * 家族招待の失敗コード。画面文言への変換は action が行う。
 */
export const FamilyInviteErrorCode = {
    INVALID_EMAIL: "INVALID_EMAIL",
    NOT_OWNER: "NOT_OWNER",
    GUEST_NOT_ALLOWED: "GUEST_NOT_ALLOWED",
    DUPLICATE_ACTIVE_INVITE: "DUPLICATE_ACTIVE_INVITE",
    INVITE_EXPIRED: "INVITE_EXPIRED",
    INVITE_REVOKED: "INVITE_REVOKED",
    INVITE_ALREADY_USED: "INVITE_ALREADY_USED",
    INVITE_NOT_USABLE: "INVITE_NOT_USABLE",
    ALREADY_IN_FAMILY: "ALREADY_IN_FAMILY",
    FAMILY_MEMBER_LIMIT: "FAMILY_MEMBER_LIMIT",
    EMAIL_NOT_CONFIRMED: "EMAIL_NOT_CONFIRMED",
} as const;

export type FamilyInviteErrorCode =
    (typeof FamilyInviteErrorCode)[keyof typeof FamilyInviteErrorCode];

/**
 * 失敗コードの Error を作る。
 * @param code 失敗コード
 * @returns そのコードを message に持つ Error
 */
export function familyInviteError(code: FamilyInviteErrorCode): Error {
    return new Error(code);
}
