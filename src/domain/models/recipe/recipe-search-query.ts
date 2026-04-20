/**
 * レシピ検索
 */
export interface RecipeSearchQuery {
    keyword: string;        //検索用キーワード
    categorySlug?: string;  // カテゴリ検索(Category の slug と一致)
}
