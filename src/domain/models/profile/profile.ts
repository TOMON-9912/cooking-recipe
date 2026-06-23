/** プロフィールで選べる既定アイコンのキー */
export type ProfileAvatarIconKey =
    | "chef-hat"
    | "utensils"
    | "heart"
    | "home"
    | "smile"
    | "user"
    | "coffee"
    | "leaf";

/** 許可されるアイコンキーの一覧 */
export const PROFILE_AVATAR_ICON_KEYS: readonly ProfileAvatarIconKey[] = [
    "chef-hat",
    "utensils",
    "heart",
    "home",
    "smile",
    "user",
    "coffee",
    "leaf",
];

/**
 * プロフィールアイコンキーが許可リストに含まれるか判定する
 * @param value 判定対象
 * @returns 許可リストに含まれる場合 true
 */
export function isProfileAvatarIconKey(
    value: string,
): value is ProfileAvatarIconKey {
    return (PROFILE_AVATAR_ICON_KEYS as readonly string[]).includes(value);
}

/**
 * ユーザープロフィール
 */
export interface Profile {
    userId: string;
    displayName: string;
    avatarIcon: ProfileAvatarIconKey;
    createdAt: Date;
    updatedAt: Date;
}
