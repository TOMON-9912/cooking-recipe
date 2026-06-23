import type { Profile } from "@/domain/models/profile/profile";
import type { CreateProfileInput } from "@/domain/repositories/profile/profile-repository";
import {
    isProfileAvatarIconKey,
} from "@/domain/models/profile/profile";

const DISPLAY_NAME_MAX_LENGTH = 30;

/**
 * プロフィール作成ユースケースが依存する処理。
 * app 層で infrastructure の実装を渡す。
 */
export type CreateProfileDeps = {
    findProfileByUserId: (userId: string) => Promise<Profile | null>;
    createProfile: (input: CreateProfileInput) => Promise<Profile>;
};

/**
 * プロフィールを新規作成する
 * @param input 作成入力
 * @param deps 依存するリポジトリ操作
 * @returns 作成されたプロフィール
 */
export const createProfileUsecase = async (
    input: CreateProfileInput,
    deps: CreateProfileDeps,
): Promise<Profile> => {
    const trimmedName = input.displayName.trim();
    if (trimmedName.length === 0) {
        throw new Error("DISPLAY_NAME_REQUIRED");
    }
    if (trimmedName.length > DISPLAY_NAME_MAX_LENGTH) {
        throw new Error("DISPLAY_NAME_TOO_LONG");
    }
    if (!isProfileAvatarIconKey(input.avatarIcon)) {
        throw new Error("INVALID_AVATAR_ICON");
    }

    const existingProfile = await deps.findProfileByUserId(input.userId);
    if (existingProfile !== null) {
        throw new Error("PROFILE_ALREADY_EXISTS");
    }

    return deps.createProfile({
        userId: input.userId,
        displayName: trimmedName,
        avatarIcon: input.avatarIcon,
    });
};
