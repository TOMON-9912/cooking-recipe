import {
  getRecipeThumbnailExtension,
  isAllowedRecipeThumbnailContentType,
  RECIPE_THUMBNAIL_MAX_BYTES,
} from "@/constants/recipe-thumbnail-upload";
import type { RecipeThumbnailStorage } from "@/domain/repositories/recipe/recipe-thumbnail-storage";

export type UploadRecipeThumbnailInput = {
  authorId: string;
  body: Uint8Array;
  contentType: string;
};

export type UploadRecipeThumbnailDeps = {
  storage: RecipeThumbnailStorage;
};

export type UploadRecipeThumbnailResult =
  | { success: true; path: string }
  | { success: false; error: string };

/**
 * レシピサムネイルのアップロード（バリデーション → ストレージへ委譲）。
 * 圧縮や形式変換はせず、検証を通ったバイト列をそのまま保存する。
 *
 * @param input 作者 ID と画像バイト列
 * @param deps 保存の実装
 * @returns 成功時は保存パス、失敗時はエラーメッセージ
 */
export const uploadRecipeThumbnailUsecase = async (
  input: UploadRecipeThumbnailInput,
  deps: UploadRecipeThumbnailDeps,
): Promise<UploadRecipeThumbnailResult> => {
  if (input.body.byteLength === 0) {
    return { success: false, error: "画像ファイルが空です" };
  }

  if (input.body.byteLength > RECIPE_THUMBNAIL_MAX_BYTES) {
    return {
      success: false,
      error: `画像は ${Math.floor(RECIPE_THUMBNAIL_MAX_BYTES / (1024 * 1024))}MB 以下にしてください`,
    };
  }

  if (!isAllowedRecipeThumbnailContentType(input.contentType)) {
    return {
      success: false,
      error: "対応していない画像形式です（JPEG / PNG / WebP / GIF のみ）",
    };
  }

  try {
    const { path } = await deps.storage.put({
      authorId: input.authorId,
      body: input.body,
      contentType: input.contentType,
      extension: getRecipeThumbnailExtension(input.contentType),
    });
    return { success: true, path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "画像の保存に失敗しました";
    return { success: false, error: message };
  }
};
