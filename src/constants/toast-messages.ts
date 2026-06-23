/** クエリパラメータ `toast` のキー */
export const TOAST_QUERY_KEYS = {
    FAMILY_CREATED: "familyCreated",
    PROFILE_CREATED: "profileCreated",
} as const;

export type ToastQueryKey =
    (typeof TOAST_QUERY_KEYS)[keyof typeof TOAST_QUERY_KEYS];

/** トースト表示用メッセージ */
export const TOAST_MESSAGES: Record<ToastQueryKey, string> = {
    [TOAST_QUERY_KEYS.FAMILY_CREATED]:
        "家族グループを作成しました。レシピを共有できます",
    [TOAST_QUERY_KEYS.PROFILE_CREATED]:
        "プロフィールを作成しました",
};

/** 家族作成成功後のリダイレクト先 */
export const FAMILY_CREATED_REDIRECT_PATH = `/top?toast=${TOAST_QUERY_KEYS.FAMILY_CREATED}`;

/** プロフィール作成成功後のリダイレクト先 */
export const PROFILE_CREATED_REDIRECT_PATH = `/top?toast=${TOAST_QUERY_KEYS.PROFILE_CREATED}`;
