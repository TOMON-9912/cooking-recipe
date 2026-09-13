// npm run test:run -- src/usecase/recipe/create-recipe-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/create-recipe-usecase.ts' src/usecase/recipe/create-recipe-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createRecipeUsecase } from "./create-recipe-usecase";
import { createRecipeDepsForTest } from "./create-recipe-deps-for-test";

describe("createRecipeUsecase", () => {
  const input: RecipeInput = {
    id: "recipe-1",
    title: "テストレシピ",
    description: "説明",
    servingCount: 2,
    preparationTimeMinutes: 30,
    isDraft: false,
    ingredients: [
      {
        name: "玉ねぎ",
        quantityDisplay: "1個",
        unit: "個",
        order: 0,
      },
    ],
    instructions: [{ stepNumber: 1, description: "切る" }],
    categories: [{ id: "cat-1" }],
    authorId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("レシピ作成後に材料・手順・カテゴリを保存する", async () => {
    const deps = createRecipeDepsForTest();

    const result = await createRecipeUsecase(input, deps);

    expect(deps.createRecipe).toHaveBeenCalledWith(input);
    expect(deps.saveIngredients).toHaveBeenCalledWith(
      "recipe-1",
      input.ingredients,
    );
    expect(deps.saveInstructions).toHaveBeenCalledWith(
      "recipe-1",
      input.instructions,
    );
    expect(deps.saveCategories).toHaveBeenCalledWith(
      "recipe-1",
      input.categories,
    );
    expect(result.id).toBe("recipe-1");
  });

  it("料理名は前後の空白を落として保存する", async () => {
    const deps = createRecipeDepsForTest();

    await createRecipeUsecase({ ...input, title: "  肉じゃが  " }, deps);

    expect(vi.mocked(deps.createRecipe).mock.calls[0][0].title).toBe("肉じゃが");
  });

  it("調理時間が 0 なら RECIPE_PREPARATION_TIME_INVALID", async () => {
    const deps = createRecipeDepsForTest();

    await expect(
      createRecipeUsecase({ ...input, preparationTimeMinutes: 0 }, deps),
    ).rejects.toThrow("RECIPE_PREPARATION_TIME_INVALID");
    expect(deps.createRecipe).not.toHaveBeenCalled();
  });

  it("createRecipe が失敗したら例外をそのまま throw する", async () => {
    const deps = createRecipeDepsForTest({
      createRecipe: vi.fn().mockRejectedValue(new Error("create failed")),
    });

    await expect(createRecipeUsecase(input, deps)).rejects.toThrow(
      "create failed",
    );
    expect(deps.saveIngredients).not.toHaveBeenCalled();
  });
});
