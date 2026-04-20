/** レシピサムネイル 1 ファイルあたりの上限（バイト） */
export const RECIPE_THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;

/** 許可する Content-Type（サーバー側で再検証する） */
export const RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type RecipeThumbnailAllowedContentType =
  (typeof RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES)[number];

export function isAllowedRecipeThumbnailContentType(
  contentType: string,
): contentType is RecipeThumbnailAllowedContentType {
  return (RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES as readonly string[]).includes(
    contentType,
  );
}

/** 同一ユーザーあたり、ウィンドウ内で許可するアップロード試行回数 */
export const RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW = 20;

/** レート制限ウィンドウ（ミリ秒） */
export const RECIPE_THUMBNAIL_UPLOAD_WINDOW_MS = 15 * 60 * 1000;
