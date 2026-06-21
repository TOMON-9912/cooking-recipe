// npm run test:run -- src/lib/get-presigned-image-url.test.ts
// npm run test:coverage -- --coverage.include='src/lib/get-presigned-image-url.ts' src/lib/get-presigned-image-url.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPresignedImageUrl } from "./get-presigned-image-url";

const mockSend = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class MockS3Client {
    send = mockSend;
  },
  GetObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("getPresignedImageUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AWS_REGION", "ap-northeast-1");
    vi.stubEnv("AWS_S3_BUCKET_NAME", "bucket");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "key");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "secret");
    vi.mocked(getSignedUrl).mockResolvedValue("https://signed-url");
  });

  it("プレサインド URL を返す", async () => {
    const url = await getPresignedImageUrl("recipes/u1/img.jpg");

    expect(url).toBe("https://signed-url");
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: "bucket",
      Key: "recipes/u1/img.jpg",
    });
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 3600 },
    );
  });

  it("AWS 設定不足時は throw する", async () => {
    vi.stubEnv("AWS_REGION", "");

    await expect(getPresignedImageUrl("path")).rejects.toThrow(
      "AWS の設定が不足",
    );
  });
});
