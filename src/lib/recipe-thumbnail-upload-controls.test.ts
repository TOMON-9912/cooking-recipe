// npm run test:run -- src/lib/recipe-thumbnail-upload-controls.test.ts
// npm run test:coverage -- --coverage.include='src/lib/recipe-thumbnail-upload-controls.ts' src/lib/recipe-thumbnail-upload-controls.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertRecipeThumbnailUploadRateLimit,
  logRecipeThumbnailUploadAudit,
} from "./recipe-thumbnail-upload-controls";
import {
  RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW,
} from "@/constants/recipe-thumbnail-upload";

describe("recipe-thumbnail-upload-controls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("assertRecipeThumbnailUploadRateLimit は上限未満なら通過する", () => {
    expect(() => assertRecipeThumbnailUploadRateLimit("user-a")).not.toThrow();
  });

  it("assertRecipeThumbnailUploadRateLimit は上限超過で RATE_LIMIT_EXCEEDED", () => {
    const userId = `user-limit-${Date.now()}`;
    for (let i = 0; i < RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW; i++) {
      assertRecipeThumbnailUploadRateLimit(userId);
    }

    expect(() => assertRecipeThumbnailUploadRateLimit(userId)).toThrow(
      "RATE_LIMIT_EXCEEDED",
    );
  });

  it("logRecipeThumbnailUploadAudit は構造化ログを出力する", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    logRecipeThumbnailUploadAudit({ event: "attempt", userId: "u1" });

    expect(spy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(spy.mock.calls[0][0]));
    expect(payload.type).toBe("recipe_thumbnail_upload");
    expect(payload.event).toBe("attempt");
    expect(payload.userId).toBe("u1");
  });
});
