import { describe, expect, it } from "vitest";
import { resolveThumbnailPath } from "./recipe-thumbnail-path";

describe("resolveThumbnailPath", () => {
  it("アップロードしたパスを優先する", () => {
    const path = resolveThumbnailPath({
      isEdit: true,
      uploadedPath: "new/path.jpg",
      hasPreview: true,
      currentPath: "old/path.jpg",
    });

    expect(path).toBe("new/path.jpg");
  });

  it("新規作成で画像がなければ undefined", () => {
    const path = resolveThumbnailPath({ isEdit: false, hasPreview: false });

    expect(path).toBeUndefined();
  });

  it("編集で画像を外したら null", () => {
    const path = resolveThumbnailPath({
      isEdit: true,
      hasPreview: false,
      currentPath: "old/path.jpg",
    });

    expect(path).toBeNull();
  });

  it("編集で画像をそのままにしたら既存パスを使う", () => {
    const path = resolveThumbnailPath({
      isEdit: true,
      hasPreview: true,
      currentPath: "old/path.jpg",
    });

    expect(path).toBe("old/path.jpg");
  });

  it("編集で元から画像がなければ null", () => {
    const path = resolveThumbnailPath({
      isEdit: true,
      hasPreview: true,
      currentPath: null,
    });

    expect(path).toBeNull();
  });
});
