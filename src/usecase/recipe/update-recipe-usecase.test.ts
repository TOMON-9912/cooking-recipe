// npm run test:run -- src/usecase/recipe/update-recipe-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/update-recipe-usecase.ts' src/usecase/recipe/update-recipe-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { updateRecipeUsecase } from "./update-recipe-usecase";
import { createUpdateRecipeDepsForTest } from "./update-recipe-deps-for-test";

const input = {
  id: "recipe-1",
  actorId: "user-1",
  title: " 更新後 ",
  description: "説明",
  thumbnailPath: "user-1/a.jpg",
  servingCount: 2,
  preparationTimeMinutes: 15,
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
  categories: [{ id: "cat-1", name: "主菜", slug: "main" }],
};

describe("updateRecipeUsecase", () => {
  it("作者なら更新して関連データを保存する", async () => {
    const deps = createUpdateRecipeDepsForTest();

    const result = await updateRecipeUsecase(input, deps);

    expect(deps.getRecipeById).toHaveBeenCalledWith("recipe-1");
    expect(deps.updateRecipe).toHaveBeenCalledWith({
      id: "recipe-1",
      title: "更新後",
      description: "説明",
      thumbnailPath: "user-1/a.jpg",
      servingCount: 2,
      preparationTimeMinutes: 15,
      isDraft: false,
    });
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

  it("料理名が空なら RECIPE_TITLE_REQUIRED", async () => {
    const deps = createUpdateRecipeDepsForTest();

    await expect(
      updateRecipeUsecase({ ...input, title: "   " }, deps),
    ).rejects.toThrow("RECIPE_TITLE_REQUIRED");
    expect(deps.getRecipeById).not.toHaveBeenCalled();
  });

  it("作者以外は RECIPE_UPDATE_FORBIDDEN", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi.fn().mockResolvedValue({
        id: "recipe-1",
        title: "test",
        description: "",
        servingCount: 1,
        preparationTimeMinutes: 0,
        isDraft: false,
        ingredients: [],
        instructions: [],
        categories: [],
        authorId: "other-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });

    await expect(updateRecipeUsecase(input, deps)).rejects.toThrow(
      "RECIPE_UPDATE_FORBIDDEN",
    );
    expect(deps.updateRecipe).not.toHaveBeenCalled();
  });

  it("getRecipeById が失敗したら例外をそのまま throw する", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi.fn().mockRejectedValue(new Error("RECIPE_NOT_FOUND")),
    });

    await expect(updateRecipeUsecase(input, deps)).rejects.toThrow(
      "RECIPE_NOT_FOUND",
    );
    expect(deps.updateRecipe).not.toHaveBeenCalled();
  });
});
