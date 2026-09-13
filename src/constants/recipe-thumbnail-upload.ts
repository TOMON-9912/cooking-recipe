/** レシピサムネイル 1 ファイルあたりの上限（バイト） */
export const RECIPE_THUMBNAIL_MAX_BYTES = 15 * 1024 * 1024;

/** 許可する Content-Type（サーバー側で再検証する） */
export const RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type RecipeThumbnailAllowedContentType =
  (typeof RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES)[number];

/** file input の accept 属性 */
export const RECIPE_THUMBNAIL_FILE_ACCEPT =
  RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES.join(",");

const RECIPE_THUMBNAIL_EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

/**
 * 許可された Content-Type かどうか。
 *
 * @param contentType 検証する Content-Type
 * @returns 許可されているとき true
 */
export function isAllowedRecipeThumbnailContentType(
  contentType: string,
): contentType is RecipeThumbnailAllowedContentType {
  return (RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES as readonly string[]).includes(
    contentType,
  );
}

/**
 * Content-Type から保存時の拡張子を返す。
 *
 * @param contentType 許可済みの Content-Type
 * @returns 拡張子（ドットなし）
 */
export function getRecipeThumbnailExtension(
  contentType: RecipeThumbnailAllowedContentType,
): string {
  return RECIPE_THUMBNAIL_EXTENSION_BY_CONTENT_TYPE[contentType];
}

/** 同一ユーザーあたり、ウィンドウ内で許可するアップロード試行回数 */
export const RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW = 20;

/** レート制限ウィンドウ（ミリ秒） */
export const RECIPE_THUMBNAIL_UPLOAD_WINDOW_MS = 15 * 60 * 1000;

/** Supabase Storage のレシピ画像バケット名 */
export const RECIPE_THUMBNAIL_BUCKET = "recipe-images";
