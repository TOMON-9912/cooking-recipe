import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { validateRecipeContent } from "./recipe-input-validation";

/**
 * レシピ作成ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type CreateRecipeDeps = {
  createRecipe: (input: RecipeInput) => Promise<Recipe>;
  saveIngredients: (
    recipeId: string,
    ingredients: RecipeInput["ingredients"]
  ) => Promise<void>;
  saveInstructions: (
    recipeId: string,
    instructions: RecipeInput["instructions"]
  ) => Promise<void>;
  saveCategories: (
    recipeId: string,
    categories: RecipeInput["categories"]
  ) => Promise<void>;
};

/**
 * レシピを新規作成し、材料・手順・カテゴリを保存する。
 *
 * @param input 作成するレシピ
 * @param deps 作成と関連データの保存
 * @returns 作成したレシピ
 */
export const createRecipeUsecase = async (
  input: RecipeInput,
  deps: CreateRecipeDeps
): Promise<Recipe> => {
  const { title } = validateRecipeContent(input);

  const recipe = await deps.createRecipe({ ...input, title });
  await Promise.all([
    deps.saveIngredients(recipe.id, input.ingredients),
    deps.saveInstructions(recipe.id, input.instructions),
    deps.saveCategories(recipe.id, input.categories),
  ]);
  return recipe;
};
