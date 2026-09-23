import type { Recipe } from "@/domain/models/recipe/recipe";
import type {
    RecipeInput,
    UpdateRecipeInput,
} from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient } from "@/lib/supabase/server";

type RecipeRow = {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    serving_count: number;
    preparation_time_minutes: number;
    is_draft: boolean;
    author_id: string;
    created_at: string;
    updated_at: string;
};

/**
 * recipes 行をドメインの Recipe に変換する。
 *
 * @param data Supabase から返った行
 * @returns 関連データを空にした Recipe
 */
const toRecipe = (data: RecipeRow): Recipe => ({
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    thumbnailPath: data.thumbnail_url ?? undefined,
    servingCount: data.serving_count,
    preparationTimeMinutes: data.preparation_time_minutes,
    isDraft: data.is_draft,
    authorId: data.author_id,
    ingredients: [],
    instructions: [],
    categories: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
});

export const createRecipe = async (input: RecipeInput): Promise<Recipe> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("recipes")
        .insert({
            id: input.id,
            title: input.title,
            description: input.description,
            thumbnail_url: input.thumbnailPath ?? null,
            serving_count: input.servingCount,
            preparation_time_minutes: input.preparationTimeMinutes,
            is_draft: input.isDraft,
            author_id: input.authorId,
        })
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new Error("INSERT_FAILED");

    return toRecipe(data);
};

/**
 * レシピ本体と関連データを 1 トランザクションで更新する。
 * 関連データは全削除してから入れ直すため、途中で失敗しても更新前の状態へ戻るよう RPC 経由にする。
 *
 * @param input 更新内容
 * @returns 更新後のレシピ（関連データは空）
 */
export const updateRecipeWithRelations = async (
    input: UpdateRecipeInput,
): Promise<Recipe> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase.rpc("update_recipe_with_relations", {
        p_recipe_id: input.id,
        p_title: input.title,
        p_description: input.description,
        p_thumbnail_url: input.thumbnailPath ?? null,
        p_serving_count: input.servingCount,
        p_preparation_time_minutes: input.preparationTimeMinutes,
        p_is_draft: input.isDraft,
        p_ingredients: input.ingredients.map((item) => ({
            name: item.name,
            quantity_display: item.quantityDisplay,
            quantity_value: item.quantityValue ?? null,
            unit: item.unit,
            note: item.note ?? null,
            order_position: item.order + 1,
        })),
        p_instructions: input.instructions.map((item) => ({
            step_number: item.stepNumber,
            description: item.description,
            image_url: item.imageUrl ?? null,
        })),
        p_category_ids: input.categories.map((category) => category.id),
    });

    if (error) throw error;
    if (!data) throw new Error("UPDATE_FAILED");

    return toRecipe(data as RecipeRow);
};