"use server";

import { redirect } from "next/navigation";
import type { CreateProfileResult } from "@/types/profile";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { createAuthedClient } from "@/lib/supabase/server";
import {
    createProfile,
    findProfileByUserId,
} from "@/infrastructure/repositories/profile/profile-repository-impl";
import { createProfileUsecase } from "@/usecase/profile/create-profile-usecase";
import { isProfileAvatarIconKey } from "@/domain/models/profile/profile";
import { isRedirectError } from "@/utils/redirect";
import { PROFILE_CREATED_REDIRECT_PATH } from "@/constants/toast-messages";

/**
 * プロフィール作成時のエラーをユーザー向けメッセージに変換する
 * @param error 捕捉したエラー
 * @returns 表示用メッセージ
 */
function mapCreateProfileError(error: unknown): string {
    if (error instanceof Error) {
        switch (error.message) {
            case "DISPLAY_NAME_REQUIRED":
                return ERROR_MESSAGES.DISPLAY_NAME_REQUIRED;
            case "DISPLAY_NAME_TOO_LONG":
                return ERROR_MESSAGES.DISPLAY_NAME_TOO_LONG;
            case "INVALID_AVATAR_ICON":
                return ERROR_MESSAGES.INVALID_AVATAR_ICON;
            case "PROFILE_ALREADY_EXISTS":
                return ERROR_MESSAGES.PROFILE_ALREADY_EXISTS;
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
    return ERROR_MESSAGES.PROFILE_CREATE_FAILED;
}

/**
 * プロフィール作成 Server Action
 */
export async function createProfileAction(
    _prevState: CreateProfileResult | null,
    formData: FormData,
): Promise<CreateProfileResult> {
    const displayName = formData.get("displayName") as string | null;
    const avatarIcon = formData.get("avatarIcon") as string | null;

    try {
        const { user } = await createAuthedClient();

        if (!avatarIcon || !isProfileAvatarIconKey(avatarIcon)) {
            throw new Error("INVALID_AVATAR_ICON");
        }

        await createProfileUsecase(
            {
                userId: user.id,
                displayName: displayName ?? "",
                avatarIcon,
            },
            {
                findProfileByUserId,
                createProfile,
            },
        );

        redirect(PROFILE_CREATED_REDIRECT_PATH);
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return {
            success: false,
            error: mapCreateProfileError(error),
        };
    }
}
