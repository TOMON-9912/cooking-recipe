// npm run test:run -- src/usecase/recipe/recipe-input-validation.test.ts
import { describe, expect, it } from "vitest";
import { validateRecipeContent } from "./recipe-input-validation";

const input = {
  title: "肉じゃが",
  servingCount: 2,
  preparationTimeMinutes: 30,
};

describe("validateRecipeContent", () => {
  it("前後の空白を落とした料理名を返す", () => {
    expect(validateRecipeContent({ ...input, title: "  肉じゃが  " })).toEqual({
      title: "肉じゃが",
    });
  });

  it("料理名が空白だけなら RECIPE_TITLE_REQUIRED", () => {
    expect(() => validateRecipeContent({ ...input, title: "   " })).toThrow(
      "RECIPE_TITLE_REQUIRED",
    );
  });

  it("人数が 0 なら RECIPE_SERVING_COUNT_INVALID", () => {
    expect(() => validateRecipeContent({ ...input, servingCount: 0 })).toThrow(
      "RECIPE_SERVING_COUNT_INVALID",
    );
  });

  it("人数が整数でないなら RECIPE_SERVING_COUNT_INVALID", () => {
    expect(() => validateRecipeContent({ ...input, servingCount: 1.5 })).toThrow(
      "RECIPE_SERVING_COUNT_INVALID",
    );
  });

  it("調理時間が 0 なら RECIPE_PREPARATION_TIME_INVALID", () => {
    expect(() =>
      validateRecipeContent({ ...input, preparationTimeMinutes: 0 }),
    ).toThrow("RECIPE_PREPARATION_TIME_INVALID");
  });

  it("調理時間が NaN なら RECIPE_PREPARATION_TIME_INVALID", () => {
    expect(() =>
      validateRecipeContent({ ...input, preparationTimeMinutes: Number.NaN }),
    ).toThrow("RECIPE_PREPARATION_TIME_INVALID");
  });
});
