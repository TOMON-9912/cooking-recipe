/**
 * レシピサムネイルをオブジェクトストレージへ保存する契約。
 * 実装は infrastructure（S3 Put 等）。
 */
export type PutRecipeThumbnailPayload = {
  authorId: string;
  body: Uint8Array;
  contentType: string;
  originalFilename: string;
};

export type RecipeThumbnailStorage = {
  put: (payload: PutRecipeThumbnailPayload) => Promise<{ path: string }>;
};
