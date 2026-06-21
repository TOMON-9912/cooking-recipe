// npm run test:run -- src/app/top/action.test.ts
// npm run test:coverage -- --coverage.include='src/app/top/action.ts' src/app/top/action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toggleFavoriteAction } from "./action";
import { toggleFavoriteUsecase } from "@/usecase/recipe/toggle-favorite-usecase";

vi.mock("@/usecase/recipe/toggle-favorite-usecase", () => ({
  toggleFavoriteUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/recipe/favorite-repository-impl", () => ({
  getFavoriteRecipeIds: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

describe("toggleFavoriteAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("成功時は isFavorited を返す", async () => {
    vi.mocked(toggleFavoriteUsecase).mockResolvedValue({ isFavorited: true });

    const result = await toggleFavoriteAction("recipe-1");

    expect(result).toEqual({ success: true, isFavorited: true });
    expect(toggleFavoriteUsecase).toHaveBeenCalledWith(
      "recipe-1",
      expect.objectContaining({
        getFavoriteRecipeIds: expect.any(Function),
        addFavorite: expect.any(Function),
        removeFavorite: expect.any(Function),
      }),
    );
  });

  it("失敗時はエラーメッセージを返す", async () => {
    vi.mocked(toggleFavoriteUsecase).mockRejectedValue(new Error("db down"));

    const result = await toggleFavoriteAction("recipe-1");

    expect(result).toEqual({ success: false, error: "db down" });
  });

  it("Error 以外の throw は汎用メッセージ", async () => {
    vi.mocked(toggleFavoriteUsecase).mockRejectedValue("fail");

    const result = await toggleFavoriteAction("recipe-1");

    expect(result).toEqual({
      success: false,
      error: "お気に入りの更新に失敗しました",
    });
  });
});
