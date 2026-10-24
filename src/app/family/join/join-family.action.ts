"use server";

import { redirect } from "next/navigation";
import { familyInviteMessage } from "@/app/family/family-invite-messages";
import {
    approveFamilyInvite,
    isPermanentUser,
} from "@/infrastructure/repositories/family/family-invite-repository-impl";
import { joinFamilyUsecase } from "@/usecase/family/join-family-usecase";
import { isRedirectError } from "@/utils/redirect";

export type JoinFamilyResult = { success: false; error: string };

/**
 * 宛先本人が招待を承認する。成功したら家族画面へ移る。
 * @param _prevState 直前の結果
 * @param formData 招待 ID
 * @returns 失敗したときだけ画面に出す結果
 */
export async function joinFamilyAction(
    _prevState: JoinFamilyResult | null,
    formData: FormData,
): Promise<JoinFamilyResult> {
    const inviteId = String(formData.get("inviteId") ?? "");

    try {
        await joinFamilyUsecase(
            { inviteId },
            { isPermanentUser, approveFamilyInvite },
        );
        redirect("/family");
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { success: false, error: familyInviteMessage(error) };
    }
}
