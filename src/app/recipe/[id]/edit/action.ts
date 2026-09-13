"use server";

import type { UpdateRecipeResult } from "@/domain/repositories/recipe/recipe-repository";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { updateRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { saveCategories } from "@/infrastructure/repositories/recipe/category-repository-impl";
import { getRecipeById } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { updateRecipeUsecase } from "@/usecase/recipe/update-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";

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
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    note?: string;
    order: number;
  }>;
  instructions: Array<{
    stepNumber: number;
    description: string;
  }>;
};

/**
 * レシピ更新のエラーを表示用メッセージにする。
 *
 * @param error 捕捉したエラー
 * @returns 表示用メッセージ
 */
function mapUpdateRecipeError(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "RECIPE_TITLE_REQUIRED":
        return ERROR_MESSAGES.RECIPE_TITLE_REQUIRED;
      case "RECIPE_UPDATE_FORBIDDEN":
        return ERROR_MESSAGES.RECIPE_UPDATE_FORBIDDEN;
      case "RECIPE_NOT_FOUND":
        return ERROR_MESSAGES.RECIPE_NOT_FOUND;
      case "UNAUTHORIZED":
        return ERROR_MESSAGES.SESSION_NOT_FOUND;
      default:
        return error.message;
    }
  }
  return ERROR_MESSAGES.RECIPE_UPDATE_FAILED;
}

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
        preparationTimeMinutes: formData.preparationTimeMinutes || 1,
        isDraft: formData.isDraft,
        categories: formData.categoryIds.map((id) => ({
          id,
          name: "",
          slug: "",
        })),
        ingredients: formData.ingredients.map((ing, idx) => ({
          name: ing.name,
          quantityDisplay: ing.quantity,
          quantityValue: isNaN(Number(ing.quantity))
            ? undefined
            : Number(ing.quantity) || undefined,
          unit: ing.unit,
          note: ing.note,
          order: ing.order ?? idx,
        })),
        instructions: formData.instructions.map((inst) => ({
          stepNumber: inst.stepNumber,
          description: inst.description,
        })),
      },
      {
        getRecipeById,
        updateRecipe,
        saveIngredients,
        saveInstructions,
        saveCategories,
      },
    );

    return { success: true, recipe };
  } catch (error) {
    return { success: false, error: mapUpdateRecipeError(error) };
  }
}
