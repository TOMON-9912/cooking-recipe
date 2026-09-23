import type { IngredientInput } from "@/domain/repositories/recipe/ingredient-repository";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * レシピの材料を全削除してから入れ直す。
 *
 * @param recipeId 対象レシピ
 * @param ingredients 保存する材料
 */
export const saveIngredients = async (
    recipeId: string,
    ingredients: IngredientInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const { error: deleteError } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", recipeId);

    if (deleteError) throw deleteError;
    if (ingredients.length === 0) return;

    const insertData = ingredients.map((item) => ({
        recipe_id: recipeId,
        ingredient_id: item.ingredientId ?? null,
        name: item.name,
        quantity_display: item.quantityDisplay,
        quantity_value: item.quantityValue ?? null,
        unit: item.unit,
        note: item.note ?? null,
        order_position: item.order + 1,
    }));

    const { error } = await supabase
        .from("recipe_ingredients")
        .insert(insertData);

    if (error) throw error;
};