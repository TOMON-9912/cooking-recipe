"use server";

/**
 * レシピ本文・材料・手順の保存。サムネイルの Storage 保存は別 Action（画像の流れは下記）。
 * @see src/app/recipe/new/レシピ新規と画像.md
 */

import { revalidatePath } from "next/cache";
import type { CreateRecipeResult, RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { saveCategories } from "@/infrastructure/repositories/recipe/category-repository-impl";
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";
import { toRecipeErrorMessage } from "@/app/recipe/recipe-action-error";
import {
  toCategoryInputs,
  toIngredientInputs,
  toInstructionInputs,
  type IngredientFormData,
  type InstructionFormData,
} from "@/app/recipe/recipe-form-mapping";

/** フォームから送信されるデータの型（UI 都合の型） */
export type CreateRecipeFormData = {
  title: string;
  description: string;
  servingCount: number;
  preparationTimeMinutes: number;
  isDraft: boolean;
  /** Storage にアップロード済みの画像パス（例: user-id/uuid.jpg）。未選択の場合は undefined */
  thumbnailPath?: string;
  categoryIds: string[];
  ingredients: IngredientFormData[];
  instructions: InstructionFormData[];
};

/**
 * レシピ登録 Server Action
 * id / authorId / createdAt / updatedAt はサーバーで付与する。
 */
export async function createRecipeAction(
  formData: CreateRecipeFormData
): Promise<CreateRecipeResult> {
  try {
    const { user } = await createAuthedClient();
    const now = new Date();

    const recipeInput: RecipeInput = {
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
      title: formData.title,
      description: formData.description,
      thumbnailPath: formData.thumbnailPath,
      servingCount: formData.servingCount,
      preparationTimeMinutes: formData.preparationTimeMinutes,
      isDraft: formData.isDraft,
      categories: toCategoryInputs(formData.categoryIds),
      ingredients: toIngredientInputs(formData.ingredients),
      instructions: toInstructionInputs(formData.instructions),
    };

    const deps = {
      createRecipe,
      saveIngredients,
      saveInstructions,
      saveCategories,
    };

    const recipe = await createRecipeUsecase(recipeInput, deps);

    revalidatePath("/top");

    return { success: true, recipe };
  } catch (error) {
    return {
      success: false,
      error: toRecipeErrorMessage(error, ERROR_MESSAGES.RECIPE_CREATE_FAILED),
    };
  }
}
