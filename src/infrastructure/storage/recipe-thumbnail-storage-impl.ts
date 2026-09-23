import type {
  PutRecipeThumbnailPayload,
  RecipeThumbnailStorage,
} from "@/domain/repositories/recipe/recipe-thumbnail-storage";
import { RECIPE_THUMBNAIL_BUCKET } from "@/constants/recipe-thumbnail-upload";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * サムネイルを Supabase Storage に原寸のまま保存する
 * @param payload 作者 ID と保存用のバイト列
 * @returns バケット内のオブジェクトパス（{authorId}/{uuid}.{ext}）
 */
export const putRecipeThumbnail = async (
  payload: PutRecipeThumbnailPayload,
): Promise<{ path: string }> => {
  const { supabase } = await createAuthedClient();
  const path = `${payload.authorId}/${crypto.randomUUID()}.${payload.extension}`;

  const { error } = await supabase.storage
    .from(RECIPE_THUMBNAIL_BUCKET)
    .upload(path, Buffer.from(payload.body), {
      contentType: payload.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return { path };
};

/**
 * 差し替え前などで不要になったサムネイルを削除する
 * @param path バケット内のオブジェクトパス
 */
export const removeRecipeThumbnail = async (path: string): Promise<void> => {
  const { supabase } = await createAuthedClient();

  const { error } = await supabase.storage
    .from(RECIPE_THUMBNAIL_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
};

export const recipeThumbnailStorageImpl: RecipeThumbnailStorage = {
  put: putRecipeThumbnail,
  remove: removeRecipeThumbnail,
};
