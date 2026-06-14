export interface FavoriteRepository {
  getFavoriteRecipeIds(): Promise<string[]>;
}
