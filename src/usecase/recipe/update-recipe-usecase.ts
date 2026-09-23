import type { Recipe } from "@/domain/models/recipe/recipe";
import type { UpdateRecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { validateRecipeContent } from "./recipe-input-validation";

/**
 * レシピ更新ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type UpdateRecipeDeps = {
  getRecipeById: (id: string) => Promise<Recipe>;
  updateRecipeWithRelations: (input: UpdateRecipeInput) => Promise<Recipe>;
  removeThumbnail: (path: string) => Promise<void>;
};

export type UpdateRecipeUsecaseInput = UpdateRecipeInput & {
  actorId: string;
};

/**
 * 作者本人のレシピを更新する。
 *
 * @param input 更新内容と操作者
 * @param deps 取得・更新・サムネイル削除
 * @returns 更新後のレシピ
 */
export const updateRecipeUsecase = async (
  input: UpdateRecipeUsecaseInput,
  deps: UpdateRecipeDeps,
): Promise<Recipe> => {
  const { title } = validateRecipeContent(input);

  const existing = await deps.getRecipeById(input.id);
  if (existing.authorId !== input.actorId) {
    throw new Error("RECIPE_UPDATE_FORBIDDEN");
  }

  const recipe = await deps.updateRecipeWithRelations({
    id: input.id,
    title,
    description: input.description,
    thumbnailPath: input.thumbnailPath,
    servingCount: input.servingCount,
    preparationTimeMinutes: input.preparationTimeMinutes,
    isDraft: input.isDraft,
    ingredients: input.ingredients,
    instructions: input.instructions,
    categories: input.categories,
  });

  await removeReplacedThumbnail(existing.thumbnailPath, recipe.thumbnailPath, deps);

  return recipe;
};

/**
 * 差し替え・削除で参照されなくなったサムネイルを消す。
 * 消せなくても更新自体は成功しているため、失敗は握ってログに残す。
 *
 * @param previousPath 更新前のパス
 * @param currentPath 更新後のパス
 * @param deps サムネイル削除を持つ依存
 */
const removeReplacedThumbnail = async (
  previousPath: string | undefined,
  currentPath: string | undefined,
  deps: UpdateRecipeDeps,
): Promise<void> => {
  if (!previousPath || previousPath === currentPath) {
    return;
  }

  try {
    await deps.removeThumbnail(previousPath);
  } catch (error) {
    console.error("failed to remove replaced thumbnail", {
      path: previousPath,
      error,
    });
  }
};
