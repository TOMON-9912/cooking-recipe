import { vi } from "vitest";
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { UpdateRecipeDeps } from "./update-recipe-usecase";

/**
 * テスト用の UpdateRecipeDeps を生成する。
 *
 * @param overrides 上書きする deps
 * @returns モック済み deps
 */
export function createUpdateRecipeDepsForTest(
  overrides: Partial<UpdateRecipeDeps> = {},
): UpdateRecipeDeps {
  const mockRecipe: Recipe = {
    id: "recipe-1",
    title: "test",
    description: "",
    servingCount: 1,
    preparationTimeMinutes: 1,
    isDraft: false,
    ingredients: [],
    instructions: [],
    categories: [],
    authorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    getRecipeById: vi.fn().mockResolvedValue(mockRecipe),
    updateRecipeWithRelations: vi.fn().mockResolvedValue(mockRecipe),
    removeThumbnail: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
