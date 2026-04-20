import type { RecipeSearchQuery } from "@/domain/models/recipe/recipe-search-query";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";

type SearchRecipeSummariesDeps = {
  getRecipeSummariesWithFavoriteBySearchQuery: (
    query: RecipeSearchQuery,
  ) => Promise<RecipeSummaryWithFavorite[]>;
};

export const searchRecipeSummaries = async (
  query: RecipeSearchQuery,
  deps: SearchRecipeSummariesDeps,
): Promise<RecipeSummaryWithFavorite[]> => {
  return deps.getRecipeSummariesWithFavoriteBySearchQuery(query);
};
