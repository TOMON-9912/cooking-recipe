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
    preparationTimeMinutes: 0,
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
    updateRecipe: vi.fn().mockResolvedValue(mockRecipe),
    saveIngredients: vi.fn().mockResolvedValue(undefined),
    saveInstructions: vi.fn().mockResolvedValue(undefined),
    saveCategories: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
