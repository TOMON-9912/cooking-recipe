// npm run test:run -- src/usecase/recipe/upload-recipe-thumbnail-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/upload-recipe-thumbnail-usecase.ts' src/usecase/recipe/upload-recipe-thumbnail-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { RECIPE_THUMBNAIL_MAX_BYTES } from "@/constants/recipe-thumbnail-upload";
import type { RecipeThumbnailStorage } from "@/domain/repositories/recipe/recipe-thumbnail-storage";
import { uploadRecipeThumbnailUsecase } from "./upload-recipe-thumbnail-usecase";

describe("uploadRecipeThumbnailUsecase", () => {
  const storage: RecipeThumbnailStorage = {
    put: vi.fn().mockResolvedValue({ path: "recipes/u/abc.jpg" }),
  };

  it("空ボディは拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array(0),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      },
      { storage },
    );
    expect(r).toEqual({ success: false, error: "画像ファイルが空です" });
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("サイズ超過は拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array(RECIPE_THUMBNAIL_MAX_BYTES + 1),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      },
      { storage },
    );
    expect(r.success).toBe(false);
    expect(r.success === false && r.error).toContain("MB");
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("未対応 MIME は拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "application/pdf",
        originalFilename: "a.pdf",
      },
      { storage },
    );
    expect(r).toEqual({
      success: false,
      error: "対応していない画像形式です（JPEG / PNG / WebP / GIF のみ）",
    });
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("検証を通すと storage.put が呼ばれる", async () => {
    const body = new Uint8Array([1, 2, 3]);
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body,
        contentType: "image/png",
        originalFilename: "x.png",
      },
      { storage },
    );
    expect(r).toEqual({ success: true, path: "recipes/u/abc.jpg" });
    expect(storage.put).toHaveBeenCalledWith({
      authorId: "u1",
      body,
      contentType: "image/png",
      originalFilename: "x.png",
    });
  });

  it("storage.put が失敗したらエラーメッセージを返す", async () => {
    const failingStorage: RecipeThumbnailStorage = {
      put: vi.fn().mockRejectedValue(new Error("S3 error")),
    };

    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      },
      { storage: failingStorage },
    );

    expect(r).toEqual({ success: false, error: "S3 error" });
  });

  it("storage.put が Error 以外を throw したら汎用メッセージを返す", async () => {
    const failingStorage: RecipeThumbnailStorage = {
      put: vi.fn().mockRejectedValue("unexpected"),
    };

    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
        originalFilename: "a.jpg",
      },
      { storage: failingStorage },
    );

    expect(r).toEqual({ success: false, error: "画像の保存に失敗しました" });
  });
});
