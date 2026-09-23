import { ERROR_MESSAGES } from "@/constants/error-messages";

const MESSAGE_BY_CODE: Record<string, string> = {
  RECIPE_TITLE_REQUIRED: ERROR_MESSAGES.RECIPE_TITLE_REQUIRED,
  RECIPE_SERVING_COUNT_INVALID: ERROR_MESSAGES.RECIPE_SERVING_COUNT_INVALID,
  RECIPE_PREPARATION_TIME_INVALID:
    ERROR_MESSAGES.RECIPE_PREPARATION_TIME_INVALID,
  RECIPE_UPDATE_FORBIDDEN: ERROR_MESSAGES.RECIPE_UPDATE_FORBIDDEN,
  RECIPE_NOT_FOUND: ERROR_MESSAGES.RECIPE_NOT_FOUND,
  UNAUTHORIZED: ERROR_MESSAGES.SESSION_NOT_FOUND,
};

/**
 * レシピ操作のエラーを表示用メッセージにする。
 * 未知のエラーは DB の内部メッセージが漏れないよう定型文にし、原因はサーバーログへ残す。
 *
 * @param error 捕捉したエラー
 * @param fallback 未知のエラーのときに表示するメッセージ
 * @returns 表示用メッセージ
 */
export const toRecipeErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error) {
    const known = MESSAGE_BY_CODE[error.message];
    if (known) {
      return known;
    }
  }

  console.error("recipe action failed", error);
  return fallback;
};
