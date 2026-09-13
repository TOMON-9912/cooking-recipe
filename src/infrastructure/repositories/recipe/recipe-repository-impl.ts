import type { Recipe } from "@/domain/models/recipe/recipe";
import type {
    RecipeInput,
    UpdateRecipePayload,
} from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * recipes 行をドメインの Recipe に変換する。
 *
 * @param data Supabase から返った行
 * @returns 関連データを空にした Recipe
 */
const toRecipe = (data: {
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
}): Recipe => ({
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
 * レシピ本体を更新する。材料・手順・カテゴリは含めない。
 *
 * @param input 更新するレシピ行
 * @returns 更新後のレシピ（関連データは空）
 */
export const updateRecipe = async (input: UpdateRecipePayload): Promise<Recipe> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("recipes")
        .update({
            title: input.title,
            description: input.description,
            thumbnail_url: input.thumbnailPath ?? null,
            serving_count: input.servingCount,
            preparation_time_minutes: input.preparationTimeMinutes,
            is_draft: input.isDraft,
        })
        .eq("id", input.id)
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new Error("UPDATE_FAILED");

    return toRecipe(data);
};