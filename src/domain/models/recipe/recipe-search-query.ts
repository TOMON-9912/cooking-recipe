import type { Category } from "./category";

/**
 * レシピ検索
 */
export interface RecipeSummary {
    keyword: string;        //検索用キーワード
    categorySlug?: string;  // カテゴリ検索(Category の slug と一致)
}
