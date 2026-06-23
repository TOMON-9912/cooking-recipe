import type { Profile, ProfileAvatarIconKey } from "@/domain/models/profile/profile";

export type CreateProfileInput = {
    userId: string;
    displayName: string;
    avatarIcon: ProfileAvatarIconKey;
};

export interface ProfileRepository {
    /**
     * ユーザー ID でプロフィールを取得する
     * 未作成の場合は null を返す
     */
    findByUserId(userId: string): Promise<Profile | null>;

    /**
     * プロフィールを新規作成する
     */
    create(input: CreateProfileInput): Promise<Profile>;
}
