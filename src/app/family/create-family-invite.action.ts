"use server";

import { revalidatePath } from "next/cache";
import { familyInviteMessage } from "@/app/family/family-invite-messages";
import {
    createFamilyInvite,
    isOwnerOfFamily,
    isPermanentUser,
} from "@/infrastructure/repositories/family/family-invite-repository-impl";
import { createFamilyInviteUsecase } from "@/usecase/family/create-family-invite-usecase";
import { isRedirectError } from "@/utils/redirect";

export type CreateFamilyInviteResult =
    | { success: true }
    | { success: false; error: string };

/**
 * オーナーが宛先を指定して招待を発行する。
 * @param _prevState 直前の結果
 * @param formData 宛先メール
 * @returns 成功、または画面に出す失敗
 */
export async function createFamilyInviteAction(
    _prevState: CreateFamilyInviteResult | null,
    formData: FormData,
): Promise<CreateFamilyInviteResult> {
    const familyId = String(formData.get("familyId") ?? "");
    const invitedEmail = String(formData.get("invitedEmail") ?? "");

    try {
        await createFamilyInviteUsecase(
            { familyId, invitedEmail },
            {
                isPermanentUser,
                isOwnerOfFamily,
                createFamilyInvite: ({ familyId: id, invitedEmail: email }) =>
                    createFamilyInvite(id, email),
            },
        );
        revalidatePath("/family");
        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { success: false, error: familyInviteMessage(error) };
    }
}
