/**
 * サムネイルアップロード用の「玄関まわり」だけをまとめたモジュール。
 * - レート制限（プロセス内。本番で厳密に揃えるなら Redis 等へ）
 * - 監査用の構造化ログ（stdout。本番はログ基盤へ）
 *
 * 全体の流れは `src/app/recipe/new/レシピ新規と画像.md` を参照。
 */
import {
  RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW,
  RECIPE_THUMBNAIL_UPLOAD_WINDOW_MS,
} from "@/constants/recipe-thumbnail-upload";

// ---------- レート制限 ----------

const timestampsByUser = new Map<string, number[]>();

export function assertRecipeThumbnailUploadRateLimit(userId: string): void {
  const now = Date.now();
  const windowStart = now - RECIPE_THUMBNAIL_UPLOAD_WINDOW_MS;

  const prev = timestampsByUser.get(userId) ?? [];
  const recent = prev.filter((t) => t > windowStart);

  if (recent.length >= RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  recent.push(now);
  timestampsByUser.set(userId, recent);
}

// ---------- 監査ログ ----------

export type RecipeThumbnailUploadAuditEvent =
  | "attempt"
  | "success"
  | "reject_empty_file"
  | "reject_rate_limit"
  | "reject_validation"
  | "reject_unauthorized"
  | "error";

export type RecipeThumbnailUploadAuditPayload = {
  event: RecipeThumbnailUploadAuditEvent;
  userId?: string;
  byteSize?: number;
  contentType?: string;
  path?: string;
  message?: string;
};

export function logRecipeThumbnailUploadAudit(
  payload: RecipeThumbnailUploadAuditPayload,
): void {
  console.info(
    JSON.stringify({
      type: "recipe_thumbnail_upload",
      at: new Date().toISOString(),
      ...payload,
    }),
  );
}
