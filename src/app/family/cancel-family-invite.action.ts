"use server";

import { revalidatePath } from "next/cache";
import { familyInviteMessage } from "@/app/family/family-invite-messages";
import {
    cancelFamilyInvite,
    isOwnerOfFamily,
    isPermanentUser,
} from "@/infrastructure/repositories/family/family-invite-repository-impl";
import { cancelFamilyInviteUsecase } from "@/usecase/family/cancel-family-invite-usecase";
import { isRedirectError } from "@/utils/redirect";

export type CancelFamilyInviteResult =
    | { success: true }
    | { success: false; error: string };

/**
 * オーナーが未使用の招待を取り消す。
 * @param _prevState 直前の結果
 * @param formData 家族と招待
 * @returns 成功、または画面に出す失敗
 */
export async function cancelFamilyInviteAction(
    _prevState: CancelFamilyInviteResult | null,
    formData: FormData,
): Promise<CancelFamilyInviteResult> {
    const familyId = String(formData.get("familyId") ?? "");
    const inviteId = String(formData.get("inviteId") ?? "");

    try {
        await cancelFamilyInviteUsecase(
            { familyId, inviteId },
            {
                isPermanentUser,
                isOwnerOfFamily,
                cancelFamilyInvite,
            },
        );
        revalidatePath("/family");
        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { success: false, error: familyInviteMessage(error) };
    }
}
