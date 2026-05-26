import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";

export interface RecipeReadRepository {
  getRecipeSummaries(): Promise<RecipeSummary[]>;
}
