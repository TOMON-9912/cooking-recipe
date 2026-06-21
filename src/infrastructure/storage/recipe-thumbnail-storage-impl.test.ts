// npm run test:run -- src/infrastructure/storage/recipe-thumbnail-storage-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/storage/recipe-thumbnail-storage-impl.ts' src/infrastructure/storage/recipe-thumbnail-storage-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { recipeThumbnailStorageImpl } from "./recipe-thumbnail-storage-impl";

const mockSend = vi.fn().mockResolvedValue({});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class MockS3Client {
    send = mockSend;
  },
  PutObjectCommand: vi.fn(),
}));

describe("recipeThumbnailStorageImpl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
    vi.stubEnv("AWS_REGION", "ap-northeast-1");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "key");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "secret");
    vi.stubEnv("AWS_S3_BUCKET_NAME", "bucket");
  });

  it("put は S3 にアップロードして path を返す", async () => {
    const body = new Uint8Array([1, 2, 3]);

    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body,
      contentType: "image/png",
      originalFilename: "photo.png",
    });

    expect(result.path).toMatch(/^recipes\/user-1\/.+\.png$/);
    expect(mockSend).toHaveBeenCalledOnce();
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "bucket",
        Body: body,
        ContentType: "image/png",
      }),
    );
  });

  it("拡張子不明は jpg になる", async () => {
    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body: new Uint8Array([1]),
      contentType: "image/jpeg",
      originalFilename: "noext",
    });

    expect(result.path).toMatch(/\.jpg$/);
  });

  it("jpeg 拡張子は jpg に正規化される", async () => {
    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body: new Uint8Array([1]),
      contentType: "image/jpeg",
      originalFilename: "photo.jpeg",
    });

    expect(result.path).toMatch(/\.jpg$/);
  });

  it("webp 拡張子はそのまま使う", async () => {
    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body: new Uint8Array([1]),
      contentType: "image/webp",
      originalFilename: "photo.webp",
    });

    expect(result.path).toMatch(/\.webp$/);
  });

  it("拡張子なし（ドットのみ）は jpg になる", async () => {
    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body: new Uint8Array([1]),
      contentType: "image/jpeg",
      originalFilename: "photo.",
    });

    expect(result.path).toMatch(/\.jpg$/);
  });

  it("AWS_ACCESS_KEY_ID 未設定時は throw する", async () => {
    vi.stubEnv("AWS_ACCESS_KEY_ID", "");

    await expect(
      recipeThumbnailStorageImpl.put({
        authorId: "user-1",
        body: new Uint8Array([1]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      }),
    ).rejects.toThrow("AWS の設定が不足");
  });

  it("AWS_SECRET_ACCESS_KEY 未設定時は throw する", async () => {
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");

    await expect(
      recipeThumbnailStorageImpl.put({
        authorId: "user-1",
        body: new Uint8Array([1]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      }),
    ).rejects.toThrow("AWS の設定が不足");
  });

  it("AWS 設定不足時は throw する", async () => {
    vi.stubEnv("AWS_REGION", "");

    await expect(
      recipeThumbnailStorageImpl.put({
        authorId: "user-1",
        body: new Uint8Array([1]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      }),
    ).rejects.toThrow("AWS の設定が不足");
  });

  it("バケット未設定時は throw する", async () => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "");

    await expect(
      recipeThumbnailStorageImpl.put({
        authorId: "user-1",
        body: new Uint8Array([1]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      }),
    ).rejects.toThrow("AWS_S3_BUCKET_NAME");
  });
});
