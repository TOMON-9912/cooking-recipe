type RecipeContent = {
  title: string;
  servingCount: number;
  preparationTimeMinutes: number;
};

/**
 * レシピの作成・更新で共通の入力チェック。
 * 値の補正はせず、満たさないものは例外にする。
 *
 * @param input 検証するレシピの基本項目
 * @returns 前後の空白を落とした料理名
 * @throws 料理名が空、人数・調理時間が 1 以上の整数でない場合
 */
export const validateRecipeContent = (input: RecipeContent): { title: string } => {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new Error("RECIPE_TITLE_REQUIRED");
  }

  if (!Number.isInteger(input.servingCount) || input.servingCount < 1) {
    throw new Error("RECIPE_SERVING_COUNT_INVALID");
  }

  if (
    !Number.isInteger(input.preparationTimeMinutes) ||
    input.preparationTimeMinutes < 1
  ) {
    throw new Error("RECIPE_PREPARATION_TIME_INVALID");
  }

  return { title };
};
