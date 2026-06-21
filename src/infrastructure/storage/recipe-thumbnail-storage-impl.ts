import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type {
  PutRecipeThumbnailPayload,
  RecipeThumbnailStorage,
} from "@/domain/repositories/recipe/recipe-thumbnail-storage";

const allowedExt = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function extensionFromFilename(filename: string): string {
  const parts = filename.split(".");
  const raw = parts[parts.length - 1].toLowerCase();
  if (allowedExt.has(raw)) return raw === "jpeg" ? "jpg" : raw;
  return "jpg";
}

function createS3Client(): S3Client {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS の設定が不足しています。.env.local を確認してください。");
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export const recipeThumbnailStorageImpl: RecipeThumbnailStorage = {
  async put(payload: PutRecipeThumbnailPayload): Promise<{ path: string }> {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error("AWS_S3_BUCKET_NAME が設定されていません。");
    }

    const ext = extensionFromFilename(payload.originalFilename);
    const path = `recipes/${payload.authorId}/${crypto.randomUUID()}.${ext}`;

    const s3 = createS3Client();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: payload.body,
        ContentType: payload.contentType,
      }),
    );

    return { path };
  },
};
