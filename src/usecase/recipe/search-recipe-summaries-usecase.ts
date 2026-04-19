import type { RecipeSearchQuery } from "@/domain/models/recipe/recipe-search-query";
import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";

type SearchRecipeSummariesDeps = {
  getRecipeSummariesBySearchQuery: (
    query: RecipeSearchQuery,
  ) => Promise<RecipeSummary[]>;
  getFavoriteRecipeIds: () => Promise<string[]>;
};

export const searchRecipeSummaries = async (
  query: RecipeSearchQuery,
  deps: SearchRecipeSummariesDeps,
): Promise<RecipeSummaryWithFavorite[]> => {
  const [summaries, favoriteIds] = await Promise.all([
    deps.getRecipeSummariesBySearchQuery(query),
    deps.getFavoriteRecipeIds(),
  ]);

  const favoriteSet = new Set(favoriteIds);

  return summaries.map((summary) => ({
    ...summary,
    isFavorited: favoriteSet.has(summary.id),
  }));
};
