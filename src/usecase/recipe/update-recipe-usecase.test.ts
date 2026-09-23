// npm run test:run -- src/usecase/recipe/update-recipe-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/update-recipe-usecase.ts' src/usecase/recipe/update-recipe-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { Recipe } from "@/domain/models/recipe/recipe";
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
  categories: [{ id: "cat-1" }],
};

/**
 * テスト用のレシピを作る。
 *
 * @param overrides 上書きする項目
 * @returns レシピ
 */
const createRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: "recipe-1",
  title: "更新前",
  description: "",
  servingCount: 1,
  preparationTimeMinutes: 1,
  isDraft: false,
  ingredients: [],
  instructions: [],
  categories: [],
  authorId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("updateRecipeUsecase", () => {
  it("作者なら本体と関連データをまとめて更新する", async () => {
    const deps = createUpdateRecipeDepsForTest();

    const result = await updateRecipeUsecase(input, deps);

    expect(deps.getRecipeById).toHaveBeenCalledWith("recipe-1");
    expect(deps.updateRecipeWithRelations).toHaveBeenCalledWith({
      id: "recipe-1",
      title: "更新後",
      description: "説明",
      thumbnailPath: "user-1/a.jpg",
      servingCount: 2,
      preparationTimeMinutes: 15,
      isDraft: false,
      ingredients: input.ingredients,
      instructions: input.instructions,
      categories: input.categories,
    });
    expect(result.id).toBe("recipe-1");
  });

  it("サムネイル削除は thumbnailPath: null のまま渡す", async () => {
    const deps = createUpdateRecipeDepsForTest();

    await updateRecipeUsecase({ ...input, thumbnailPath: null }, deps);

    expect(vi.mocked(deps.updateRecipeWithRelations).mock.calls[0][0]).toMatchObject({
      thumbnailPath: null,
    });
  });

  it("下書きへ戻す指定をそのまま渡す", async () => {
    const deps = createUpdateRecipeDepsForTest();

    await updateRecipeUsecase({ ...input, isDraft: true }, deps);

    expect(vi.mocked(deps.updateRecipeWithRelations).mock.calls[0][0]).toMatchObject({
      isDraft: true,
    });
  });

  it("差し替えで不要になったサムネイルを削除する", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi
        .fn()
        .mockResolvedValue(createRecipe({ thumbnailPath: "user-1/old.jpg" })),
      updateRecipeWithRelations: vi
        .fn()
        .mockResolvedValue(createRecipe({ thumbnailPath: "user-1/a.jpg" })),
    });

    await updateRecipeUsecase(input, deps);

    expect(deps.removeThumbnail).toHaveBeenCalledWith("user-1/old.jpg");
  });

  it("サムネイルが変わらないなら削除しない", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi
        .fn()
        .mockResolvedValue(createRecipe({ thumbnailPath: "user-1/a.jpg" })),
      updateRecipeWithRelations: vi
        .fn()
        .mockResolvedValue(createRecipe({ thumbnailPath: "user-1/a.jpg" })),
    });

    await updateRecipeUsecase(input, deps);

    expect(deps.removeThumbnail).not.toHaveBeenCalled();
  });

  it("サムネイル削除に失敗しても更新は成功扱いにする", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi
        .fn()
        .mockResolvedValue(createRecipe({ thumbnailPath: "user-1/old.jpg" })),
      removeThumbnail: vi.fn().mockRejectedValue(new Error("remove failed")),
    });

    const result = await updateRecipeUsecase(input, deps);

    expect(result.id).toBe("recipe-1");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("料理名が空なら RECIPE_TITLE_REQUIRED", async () => {
    const deps = createUpdateRecipeDepsForTest();

    await expect(
      updateRecipeUsecase({ ...input, title: "   " }, deps),
    ).rejects.toThrow("RECIPE_TITLE_REQUIRED");
    expect(deps.getRecipeById).not.toHaveBeenCalled();
  });

  it("調理時間が 0 なら RECIPE_PREPARATION_TIME_INVALID", async () => {
    const deps = createUpdateRecipeDepsForTest();

    await expect(
      updateRecipeUsecase({ ...input, preparationTimeMinutes: 0 }, deps),
    ).rejects.toThrow("RECIPE_PREPARATION_TIME_INVALID");
    expect(deps.updateRecipeWithRelations).not.toHaveBeenCalled();
  });

  it("作者以外は RECIPE_UPDATE_FORBIDDEN", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi
        .fn()
        .mockResolvedValue(createRecipe({ authorId: "other-user" })),
    });

    await expect(updateRecipeUsecase(input, deps)).rejects.toThrow(
      "RECIPE_UPDATE_FORBIDDEN",
    );
    expect(deps.updateRecipeWithRelations).not.toHaveBeenCalled();
  });

  it("getRecipeById が失敗したら例外をそのまま throw する", async () => {
    const deps = createUpdateRecipeDepsForTest({
      getRecipeById: vi.fn().mockRejectedValue(new Error("RECIPE_NOT_FOUND")),
    });

    await expect(updateRecipeUsecase(input, deps)).rejects.toThrow(
      "RECIPE_NOT_FOUND",
    );
    expect(deps.updateRecipeWithRelations).not.toHaveBeenCalled();
  });
});
