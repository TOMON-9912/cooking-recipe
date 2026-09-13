import type { CategoryInput } from "@/domain/repositories/recipe/category-repository";
import type { IngredientInput } from "@/domain/repositories/recipe/ingredient-repository";
import type { InstructionInput } from "@/domain/repositories/recipe/instruction-repository";

/** 材料 1 行分のフォーム入力 */
export type IngredientFormData = {
  name: string;
  /** 表示用文字列。"適量" なども入る */
  quantity: string;
  unit: string;
  note?: string;
  order: number;
};

/** 手順 1 ステップ分のフォーム入力 */
export type InstructionFormData = {
  stepNumber: number;
  description: string;
};

/**
 * 数量の表示文字列から数値を取り出す。
 * "適量" のように数値でないものや 0 は、数量なしとして扱う。
 *
 * @param quantity 表示用の数量
 * @returns 数値として扱える場合のみその値
 */
const toQuantityValue = (quantity: string): number | undefined => {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value === 0) {
    return undefined;
  }
  return value;
};

/**
 * 材料のフォーム入力をドメインの形へ変換する。
 *
 * @param ingredients フォームの材料
 * @returns 保存用の材料
 */
export const toIngredientInputs = (
  ingredients: IngredientFormData[],
): IngredientInput[] =>
  ingredients.map((ingredient, index) => ({
    name: ingredient.name,
    quantityDisplay: ingredient.quantity,
    quantityValue: toQuantityValue(ingredient.quantity),
    unit: ingredient.unit,
    note: ingredient.note,
    order: ingredient.order ?? index,
  }));

/**
 * 手順のフォーム入力をドメインの形へ変換する。
 *
 * @param instructions フォームの手順
 * @returns 保存用の手順
 */
export const toInstructionInputs = (
  instructions: InstructionFormData[],
): InstructionInput[] =>
  instructions.map((instruction) => ({
    stepNumber: instruction.stepNumber,
    description: instruction.description,
  }));

/**
 * 選択中のカテゴリ ID をドメインの形へ変換する。
 *
 * @param categoryIds 選択されたカテゴリ ID
 * @returns 保存用のカテゴリ
 */
export const toCategoryInputs = (categoryIds: string[]): CategoryInput[] =>
  categoryIds.map((id) => ({ id }));
