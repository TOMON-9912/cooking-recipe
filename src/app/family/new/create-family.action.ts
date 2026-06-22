"use server";

import { redirect } from "next/navigation";
import type { CreateFamilyResult } from "@/types/family";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { createAuthedClient } from "@/lib/supabase/server";
import { createFamily, findFamilyByUserId } from "@/infrastructure/repositories/family/family-repository-impl";
import { addFamilyMember } from "@/infrastructure/repositories/family/family-member-repository-impl";
import { createFamilyUsecase } from "@/usecase/family/create-family-usecase";
import { isRedirectError } from "@/utils/redirect";
import { FAMILY_CREATED_REDIRECT_PATH } from "@/constants/toast-messages";

/**
 * 家族作成時のエラーをユーザー向けメッセージに変換する
 * @param error 捕捉したエラー
 * @returns 表示用メッセージ
 */
function mapCreateFamilyError(error: unknown): string {
    if (error instanceof Error) {
        switch (error.message) {
            case "FAMILY_NAME_REQUIRED":
                return ERROR_MESSAGES.FAMILY_NAME_REQUIRED;
            case "ALREADY_IN_FAMILY":
                return ERROR_MESSAGES.ALREADY_IN_FAMILY;
            case "UNAUTHORIZED":
                return ERROR_MESSAGES.SESSION_NOT_FOUND;
            default:
                return error.message;
        }
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return error.message;
    }
    return ERROR_MESSAGES.FAMILY_CREATE_FAILED;
}

/**
 * 家族グループ作成 Server Action
 * 作成後、作成者本人を family_members に追加する
 */
export async function createFamilyAction(
    _prevState: CreateFamilyResult | null,
    formData: FormData,
): Promise<CreateFamilyResult> {
    const name = formData.get("name") as string | null;

    try {
        const { user } = await createAuthedClient();

        await createFamilyUsecase(
            { name: name ?? "", ownerId: user.id },
            {
                findFamilyByUserId,
                createFamily,
                addFamilyMember,
            },
        );

        redirect(FAMILY_CREATED_REDIRECT_PATH);
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return {
            success: false,
            error: mapCreateFamilyError(error),
        };
    }
}
