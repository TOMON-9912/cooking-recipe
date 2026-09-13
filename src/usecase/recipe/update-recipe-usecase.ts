import type { Recipe } from "@/domain/models/recipe/recipe";
import type {
  RecipeInput,
  UpdateRecipePayload,
} from "@/domain/repositories/recipe/recipe-repository";

/**
 * レシピ更新ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type UpdateRecipeDeps = {
  getRecipeById: (id: string) => Promise<Recipe>;
  updateRecipe: (input: UpdateRecipePayload) => Promise<Recipe>;
  saveIngredients: (
    recipeId: string,
    ingredients: RecipeInput["ingredients"],
  ) => Promise<void>;
  saveInstructions: (
    recipeId: string,
    instructions: RecipeInput["instructions"],
  ) => Promise<void>;
  saveCategories: (
    recipeId: string,
    categories: RecipeInput["categories"],
  ) => Promise<void>;
};

export type UpdateRecipeUsecaseInput = UpdateRecipePayload & {
  actorId: string;
  ingredients: RecipeInput["ingredients"];
  instructions: RecipeInput["instructions"];
  categories: RecipeInput["categories"];
};

/**
 * 作者本人のレシピを更新する。
 *
 * @param input 更新内容と操作者
 * @param deps 取得・更新・関連データの保存
 * @returns 更新後のレシピ
 */
export const updateRecipeUsecase = async (
  input: UpdateRecipeUsecaseInput,
  deps: UpdateRecipeDeps,
): Promise<Recipe> => {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new Error("RECIPE_TITLE_REQUIRED");
  }

  const existing = await deps.getRecipeById(input.id);
  if (existing.authorId !== input.actorId) {
    throw new Error("RECIPE_UPDATE_FORBIDDEN");
  }

  const recipe = await deps.updateRecipe({
    id: input.id,
    title,
    description: input.description,
    thumbnailPath: input.thumbnailPath,
    servingCount: input.servingCount,
    preparationTimeMinutes: input.preparationTimeMinutes,
    isDraft: input.isDraft,
  });

  await Promise.all([
    deps.saveIngredients(recipe.id, input.ingredients),
    deps.saveInstructions(recipe.id, input.instructions),
    deps.saveCategories(recipe.id, input.categories),
  ]);

  return recipe;
};
