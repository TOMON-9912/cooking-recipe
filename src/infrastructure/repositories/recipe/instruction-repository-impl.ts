import type { InstructionInput } from "@/domain/repositories/recipe/instruction-repository";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * レシピの手順を全削除してから入れ直す。
 *
 * @param recipeId 対象レシピ
 * @param instructions 保存する手順
 */
export const saveInstructions = async (
    recipeId: string,
    instructions: InstructionInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const { error: deleteError } = await supabase
        .from("recipe_instructions")
        .delete()
        .eq("recipe_id", recipeId);

    if (deleteError) throw deleteError;
    if (instructions.length === 0) return;

    const insertData = instructions.map((instruction) => ({
        recipe_id: recipeId,
        step_number: instruction.stepNumber,
        description: instruction.description,
        image_url: instruction.imageUrl ?? null,
    }));

    const { error } = await supabase
        .from("recipe_instructions")
        .insert(insertData);

    if (error) throw error;
};