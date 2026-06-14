// npm run test:run -- src/usecase/recipe/search-recipe-summaries-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/search-recipe-summaries-usecase.ts' src/usecase/recipe/search-recipe-summaries-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { searchRecipeSummaries } from "./search-recipe-summaries-usecase";
import { createRecipeSummaryForTest } from "./get-recipe-summaries-deps-for-test";

describe("searchRecipeSummaries", () => {
  it("検索クエリを deps に委譲して結果を返す", async () => {
    const query = { keyword: "カレー", categorySlug: "main" };
    const summaries = [
      { ...createRecipeSummaryForTest(), isFavorited: true },
    ];
    const getRecipeSummariesWithFavoriteBySearchQuery = vi
      .fn()
      .mockResolvedValue(summaries);

    const result = await searchRecipeSummaries(query, {
      getRecipeSummariesWithFavoriteBySearchQuery,
    });

    expect(getRecipeSummariesWithFavoriteBySearchQuery).toHaveBeenCalledWith(
      query,
    );
    expect(result).toEqual(summaries);
  });

  it("deps が失敗したら例外をそのまま throw する", async () => {
    const getRecipeSummariesWithFavoriteBySearchQuery = vi
      .fn()
      .mockRejectedValue(new Error("search failed"));

    await expect(
      searchRecipeSummaries(
        { keyword: "x" },
        { getRecipeSummariesWithFavoriteBySearchQuery },
      ),
    ).rejects.toThrow("search failed");
  });
});
