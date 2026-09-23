"use server";

import { revalidatePath } from "next/cache";
import type { UpdateRecipeResult } from "@/domain/repositories/recipe/recipe-repository";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { updateRecipeWithRelations } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { getRecipeById } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { removeRecipeThumbnail } from "@/infrastructure/storage/recipe-thumbnail-storage-impl";
import { updateRecipeUsecase } from "@/usecase/recipe/update-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";
import { toRecipeErrorMessage } from "@/app/recipe/recipe-action-error";
import {
  toCategoryInputs,
  toIngredientInputs,
  toInstructionInputs,
  type IngredientFormData,
  type InstructionFormData,
} from "@/app/recipe/recipe-form-mapping";

/** 編集フォームから送るデータ */
export type UpdateRecipeFormData = {
  id: string;
  title: string;
  description: string;
  servingCount: number;
  preparationTimeMinutes: number;
  isDraft: boolean;
  /** 新しいパス、既存パス、または削除時は null */
  thumbnailPath?: string | null;
  categoryIds: string[];
  ingredients: IngredientFormData[];
  instructions: InstructionFormData[];
};

/**
 * レシピを更新する。
 *
 * @param formData 編集フォームの内容
 * @returns 成功時はレシピ、失敗時はエラーメッセージ
 */
export async function updateRecipeAction(
  formData: UpdateRecipeFormData,
): Promise<UpdateRecipeResult> {
  try {
    const { user } = await createAuthedClient();

    const recipe = await updateRecipeUsecase(
      {
        id: formData.id,
        actorId: user.id,
        title: formData.title,
        description: formData.description,
        thumbnailPath: formData.thumbnailPath,
        servingCount: formData.servingCount,
        preparationTimeMinutes: formData.preparationTimeMinutes,
        isDraft: formData.isDraft,
        categories: toCategoryInputs(formData.categoryIds),
        ingredients: toIngredientInputs(formData.ingredients),
        instructions: toInstructionInputs(formData.instructions),
      },
      {
        getRecipeById,
        updateRecipeWithRelations,
        removeThumbnail: removeRecipeThumbnail,
      },
    );

    revalidatePath("/top");
    revalidatePath(`/recipe/${recipe.id}`);

    return { success: true, recipe };
  } catch (error) {
    return {
      success: false,
      error: toRecipeErrorMessage(error, ERROR_MESSAGES.RECIPE_UPDATE_FAILED),
    };
  }
}
