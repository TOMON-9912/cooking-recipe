// npm run test:run -- src/usecase/recipe/get-recipe-summaries-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/get-recipe-summaries-usecase.ts' src/usecase/recipe/get-recipe-summaries-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { getRecipeSummariesUsecase } from "./get-recipe-summaries-usecase";
import {
  createGetRecipeSummariesDepsForTest,
  createRecipeSummaryForTest,
} from "./get-recipe-summaries-deps-for-test";

describe("getRecipeSummariesUsecase", () => {
  it("サマリーが0件なら空配列を返す", async () => {
    const deps = createGetRecipeSummariesDepsForTest();

    const result = await getRecipeSummariesUsecase(deps);

    expect(result).toEqual([]);
    expect(deps.getRecipeSummaries).toHaveBeenCalledOnce();
    expect(deps.getFavoriteRecipeIds).toHaveBeenCalledOnce();
  });

  it("お気に入りIDが空ならすべて isFavorited: false", async () => {
    const summaries = [
      createRecipeSummaryForTest({ id: "recipe-1" }),
      createRecipeSummaryForTest({ id: "recipe-2", title: "レシピ2" }),
    ];
    const deps = createGetRecipeSummariesDepsForTest({
      getRecipeSummaries: vi.fn().mockResolvedValue(summaries),
      getFavoriteRecipeIds: vi.fn().mockResolvedValue([]),
    });

    const result = await getRecipeSummariesUsecase(deps);

    expect(result).toEqual([
      { ...summaries[0], isFavorited: false },
      { ...summaries[1], isFavorited: false },
    ]);
  });

  it("お気に入りIDに含まれるレシピのみ isFavorited: true", async () => {
    const summaries = [
      createRecipeSummaryForTest({ id: "recipe-1" }),
      createRecipeSummaryForTest({ id: "recipe-2", title: "レシピ2" }),
      createRecipeSummaryForTest({ id: "recipe-3", title: "レシピ3" }),
    ];
    const deps = createGetRecipeSummariesDepsForTest({
      getRecipeSummaries: vi.fn().mockResolvedValue(summaries),
      getFavoriteRecipeIds: vi.fn().mockResolvedValue(["recipe-2"]),
    });

    const result = await getRecipeSummariesUsecase(deps);

    expect(result[0].isFavorited).toBe(false);
    expect(result[1].isFavorited).toBe(true);
    expect(result[2].isFavorited).toBe(false);
  });

  it("複数のお気に入りIDを正しく反映する", async () => {
    const summaries = [
      createRecipeSummaryForTest({ id: "recipe-1" }),
      createRecipeSummaryForTest({ id: "recipe-2", title: "レシピ2" }),
    ];
    const deps = createGetRecipeSummariesDepsForTest({
      getRecipeSummaries: vi.fn().mockResolvedValue(summaries),
      getFavoriteRecipeIds: vi
        .fn()
        .mockResolvedValue(["recipe-1", "recipe-2"]),
    });

    const result = await getRecipeSummariesUsecase(deps);

    expect(result[0].isFavorited).toBe(true);
    expect(result[1].isFavorited).toBe(true);
  });

  it("getRecipeSummaries が失敗したら例外をそのまま throw する", async () => {
    const deps = createGetRecipeSummariesDepsForTest({
      getRecipeSummaries: vi
        .fn()
        .mockRejectedValue(new Error("summaries error")),
    });

    await expect(getRecipeSummariesUsecase(deps)).rejects.toThrow(
      "summaries error",
    );
  });

  it("getFavoriteRecipeIds が失敗したら例外をそのまま throw する", async () => {
    const deps = createGetRecipeSummariesDepsForTest({
      getRecipeSummaries: vi
        .fn()
        .mockResolvedValue([createRecipeSummaryForTest()]),
      getFavoriteRecipeIds: vi
        .fn()
        .mockRejectedValue(new Error("favorites error")),
    });

    await expect(getRecipeSummariesUsecase(deps)).rejects.toThrow(
      "favorites error",
    );
  });
});
