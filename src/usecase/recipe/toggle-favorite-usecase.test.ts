// npm run test:run -- src/usecase/recipe/toggle-favorite-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/toggle-favorite-usecase.ts' src/usecase/recipe/toggle-favorite-usecase.test.ts
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  toggleFavoriteUsecase,
  type ToggleFavoriteDeps,
} from "./toggle-favorite-usecase";

describe("toggleFavoriteUsecase", () => {
  let getFavoriteRecipeIds: Mock<ToggleFavoriteDeps["getFavoriteRecipeIds"]>;
  let addFavorite: Mock<ToggleFavoriteDeps["addFavorite"]>;
  let removeFavorite: Mock<ToggleFavoriteDeps["removeFavorite"]>;

  beforeEach(() => {
    getFavoriteRecipeIds = vi.fn().mockResolvedValue([]);
    addFavorite = vi.fn().mockResolvedValue(undefined);
    removeFavorite = vi.fn().mockResolvedValue(undefined);
  });

  it("未お気に入りなら addFavorite を呼び isFavorited: true を返す", async () => {
    const result = await toggleFavoriteUsecase("recipe-1", {
      getFavoriteRecipeIds,
      addFavorite,
      removeFavorite,
    });

    expect(getFavoriteRecipeIds).toHaveBeenCalledOnce();
    expect(addFavorite).toHaveBeenCalledWith("recipe-1");
    expect(removeFavorite).not.toHaveBeenCalled();
    expect(result).toEqual({ isFavorited: true });
  });

  it("お気に入り済みなら removeFavorite を呼び isFavorited: false を返す", async () => {
    getFavoriteRecipeIds.mockResolvedValue(["recipe-1"]);

    const result = await toggleFavoriteUsecase("recipe-1", {
      getFavoriteRecipeIds,
      addFavorite,
      removeFavorite,
    });

    expect(removeFavorite).toHaveBeenCalledWith("recipe-1");
    expect(addFavorite).not.toHaveBeenCalled();
    expect(result).toEqual({ isFavorited: false });
  });

  it("getFavoriteRecipeIds が失敗したら例外をそのまま throw する", async () => {
    getFavoriteRecipeIds.mockRejectedValue(new Error("fetch failed"));

    await expect(
      toggleFavoriteUsecase("recipe-1", {
        getFavoriteRecipeIds,
        addFavorite,
        removeFavorite,
      }),
    ).rejects.toThrow("fetch failed");
  });
});
