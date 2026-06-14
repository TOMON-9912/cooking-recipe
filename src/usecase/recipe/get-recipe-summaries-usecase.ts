import type { FavoriteRepository } from "@/domain/repositories/recipe/favorite-repository";
import type { RecipeReadRepository } from "@/domain/repositories/recipe/recipe-read-repository";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";

/**
 * レシピサマリー一覧ユースケースの依存先
 * app 層で infrastructure の実装を渡す
 */
export type GetRecipeSummariesDeps = {
  getRecipeSummaries: RecipeReadRepository["getRecipeSummaries"];
  getFavoriteRecipeIds: FavoriteRepository["getFavoriteRecipeIds"];
};

/**
 * レシピサマリー一覧を取得
 * お気に入りフラグを付与してreturnする
 *
 * @param deps - サマリー取得とお気に入り ID 取得
 * @returns お気に入りフラグ付きのレシピサマリー一覧
 */
export const getRecipeSummariesUsecase = async (
  deps: GetRecipeSummariesDeps,
): Promise<RecipeSummaryWithFavorite[]> => {
  const [summaries, favoriteIds] = await Promise.all([
    deps.getRecipeSummaries(),
    deps.getFavoriteRecipeIds(),
  ]);

  const favoriteSet = new Set(favoriteIds);

  return summaries.map((summary) => ({
    ...summary,
    isFavorited: favoriteSet.has(summary.id),
  }));
};
