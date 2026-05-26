import { vi } from "vitest";
import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import type { GetRecipeSummariesDeps } from "./get-recipe-summaries-usecase";

export function createRecipeSummaryForTest(
  overrides: Partial<RecipeSummary> = {},
): RecipeSummary {
  return {
    id: "recipe-1",
    title: "テストレシピ",
    description: "説明",
    servingCount: 2,
    preparationTimeMinutes: 30,
    isDraft: false,
    authorId: "user-1",
    categories: [],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    ...overrides,
  };
}

export function createGetRecipeSummariesDepsForTest(
  overrides: Partial<GetRecipeSummariesDeps> = {},
): GetRecipeSummariesDeps {
  return {
    getRecipeSummaries: vi.fn().mockResolvedValue([]),
    getFavoriteRecipeIds: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}
