import { FamilyInviteErrorCode } from "@/domain/models/family/family-invite-error";

const messages: Record<string, string> = {
    [FamilyInviteErrorCode.INVALID_EMAIL]:
        "メールアドレスの形式を確かめてください",
    [FamilyInviteErrorCode.NOT_OWNER]: "この家族のオーナーだけが招待できます",
    [FamilyInviteErrorCode.GUEST_NOT_ALLOWED]:
        "招待は本登録のあとで使えます",
    [FamilyInviteErrorCode.DUPLICATE_ACTIVE_INVITE]:
        "同じ宛先の招待が、まだ有効です",
    [FamilyInviteErrorCode.INVITE_EXPIRED]:
        "この招待は期限切れです。オーナーに、もう一度発行してもらってください",
    [FamilyInviteErrorCode.INVITE_REVOKED]:
        "この招待は取り消されています。オーナーに、もう一度発行してもらってください",
    [FamilyInviteErrorCode.INVITE_ALREADY_USED]:
        "この招待はすでに使われています",
    [FamilyInviteErrorCode.INVITE_NOT_USABLE]:
        "この招待は使えません。オーナーに、もう一度発行してもらってください",
    [FamilyInviteErrorCode.ALREADY_IN_FAMILY]:
        "すでに家族に入っています",
    [FamilyInviteErrorCode.FAMILY_MEMBER_LIMIT]:
        "この家族は上限の人数に達しています。オーナーに相談してください",
    [FamilyInviteErrorCode.EMAIL_NOT_CONFIRMED]:
        "メールアドレスの確認が終わってから参加できます",
    UNAUTHENTICATED: "ログインしてからもう一度試してください",
};

/**
 * 招待の失敗を画面の文言にする。
 * @param error 捕捉した失敗
 * @returns 表示する文言
 */
export function familyInviteMessage(error: unknown): string {
    if (error instanceof Error) {
        return messages[error.message] ?? "招待を処理できませんでした。もう一度試してください";
    }
    return "招待を処理できませんでした。もう一度試してください";
}
