// npm run test:run -- src/usecase/recipe/get-recipe-detail-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/get-recipe-detail-usecase.ts' src/usecase/recipe/get-recipe-detail-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { Recipe } from "@/domain/models/recipe/recipe";
import { getRecipeDetailUsecase } from "./get-recipe-detail-usecase";

describe("getRecipeDetailUsecase", () => {
  const mockRecipe: Recipe = {
    id: "recipe-1",
    title: "テストレシピ",
    description: "説明",
    servingCount: 2,
    preparationTimeMinutes: 30,
    isDraft: false,
    ingredients: [],
    instructions: [],
    categories: [],
    authorId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("指定 ID で getRecipeById を呼び結果を返す", async () => {
    const getRecipeById = vi.fn().mockResolvedValue(mockRecipe);

    const result = await getRecipeDetailUsecase("recipe-1", { getRecipeById });

    expect(getRecipeById).toHaveBeenCalledWith("recipe-1");
    expect(result).toEqual(mockRecipe);
  });

  it("getRecipeById が失敗したら例外をそのまま throw する", async () => {
    const getRecipeById = vi
      .fn()
      .mockRejectedValue(new Error("RECIPE_NOT_FOUND"));

    await expect(
      getRecipeDetailUsecase("missing", { getRecipeById }),
    ).rejects.toThrow("RECIPE_NOT_FOUND");
  });
});
