import type { CategoryInput } from "@/domain/repositories/recipe/category-repository";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * レシピのカテゴリを全削除してから入れ直す。
 *
 * @param recipeId 対象レシピ
 * @param categories 保存するカテゴリ
 */
export const saveCategories = async (
    recipeId: string,
    categories: CategoryInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const { error: deleteError } = await supabase
        .from("recipe_categories")
        .delete()
        .eq("recipe_id", recipeId);

    if (deleteError) throw deleteError;
    if (categories.length === 0) return;

    const insertData = categories.map((item) => ({
        recipe_id: recipeId,
        category_id: item.id,
    }));

    const { error } = await supabase
        .from("recipe_categories")
        .insert(insertData);

    if (error) throw error;
};