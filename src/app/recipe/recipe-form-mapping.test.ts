// npm run test:run -- src/app/recipe/recipe-form-mapping.test.ts
import { describe, expect, it } from "vitest";
import {
  toCategoryInputs,
  toIngredientInputs,
  toInstructionInputs,
} from "./recipe-form-mapping";

describe("toIngredientInputs", () => {
  it("数値の数量は quantityValue にも入れる", () => {
    const [ingredient] = toIngredientInputs([
      { name: "玉ねぎ", quantity: "2", unit: "個", order: 0 },
    ]);

    expect(ingredient.quantityDisplay).toBe("2");
    expect(ingredient.quantityValue).toBe(2);
  });

  it("数値でない数量は quantityValue を持たせない", () => {
    const [ingredient] = toIngredientInputs([
      { name: "塩", quantity: "適量", unit: "", order: 0 },
    ]);

    expect(ingredient.quantityDisplay).toBe("適量");
    expect(ingredient.quantityValue).toBeUndefined();
  });

  it("空文字や 0 は quantityValue を持たせない", () => {
    const [empty, zero] = toIngredientInputs([
      { name: "水", quantity: "", unit: "", order: 0 },
      { name: "砂糖", quantity: "0", unit: "g", order: 1 },
    ]);

    expect(empty.quantityValue).toBeUndefined();
    expect(zero.quantityValue).toBeUndefined();
  });

  it("order が無ければ配列の並び順を使う", () => {
    const ingredients = toIngredientInputs([
      { name: "A", quantity: "1", unit: "", order: undefined as unknown as number },
      { name: "B", quantity: "1", unit: "", order: undefined as unknown as number },
    ]);

    expect(ingredients.map((item) => item.order)).toEqual([0, 1]);
  });
});

describe("toInstructionInputs", () => {
  it("手順番号と説明だけを渡す", () => {
    expect(toInstructionInputs([{ stepNumber: 1, description: "切る" }])).toEqual([
      { stepNumber: 1, description: "切る" },
    ]);
  });
});

describe("toCategoryInputs", () => {
  it("ID だけのカテゴリにする", () => {
    expect(toCategoryInputs(["cat-1", "cat-2"])).toEqual([
      { id: "cat-1" },
      { id: "cat-2" },
    ]);
  });
});
