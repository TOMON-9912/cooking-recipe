// npm run test:run -- src/app/recipe/[id]/edit/action.test.ts
// npm run test:coverage -- --coverage.include='src/app/recipe/[id]/edit/action.ts' src/app/recipe/[id]/edit/action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateRecipeAction } from "./action";
import { createAuthedClient } from "@/lib/supabase/server";
import { updateRecipeUsecase } from "@/usecase/recipe/update-recipe-usecase";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

vi.mock("@/usecase/recipe/update-recipe-usecase", () => ({
  updateRecipeUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/recipe/recipe-repository-impl", () => ({
  updateRecipe: vi.fn(),
}));
vi.mock(
  "@/infrastructure/repositories/recipe/recipe-read-repository-impl",
  () => ({ getRecipeById: vi.fn() }),
);
vi.mock(
  "@/infrastructure/repositories/recipe/ingredient-repository-impl",
  () => ({ saveIngredients: vi.fn() }),
);
vi.mock(
  "@/infrastructure/repositories/recipe/instruction-repository-impl",
  () => ({ saveInstructions: vi.fn() }),
);
vi.mock("@/infrastructure/repositories/recipe/category-repository-impl", () => ({
  saveCategories: vi.fn(),
}));

describe("updateRecipeAction", () => {
  const formData = {
    id: "recipe-1",
    title: "カレー",
    description: "美味しい",
    servingCount: 2,
    preparationTimeMinutes: 0,
    isDraft: false,
    thumbnailPath: "user-1/a.jpg",
    categoryIds: ["cat-1"],
    ingredients: [
      { name: "玉ねぎ", quantity: "適量", unit: "個", order: 0 },
    ],
    instructions: [{ stepNumber: 1, description: "切る" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAuthedClient).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
  });

  it("成功時は recipe を返す", async () => {
    vi.mocked(updateRecipeUsecase).mockResolvedValue({
      id: "recipe-1",
      title: "カレー",
      description: "美味しい",
      servingCount: 2,
      preparationTimeMinutes: 1,
      isDraft: false,
      ingredients: [],
      instructions: [],
      categories: [],
      authorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateRecipeAction(formData);

    expect(result.success).toBe(true);
    expect(updateRecipeUsecase).toHaveBeenCalledOnce();
    const input = vi.mocked(updateRecipeUsecase).mock.calls[0][0];
    expect(input.actorId).toBe("user-1");
    expect(input.preparationTimeMinutes).toBe(1);
    expect(input.thumbnailPath).toBe("user-1/a.jpg");
  });

  it("権限エラーは表示用メッセージにする", async () => {
    vi.mocked(updateRecipeUsecase).mockRejectedValue(
      new Error("RECIPE_UPDATE_FORBIDDEN"),
    );

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "このレシピを編集する権限がありません",
    });
  });

  it("未ログインはセッションエラーにする", async () => {
    vi.mocked(createAuthedClient).mockRejectedValue(new Error("UNAUTHORIZED"));

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "セッションが見つかりません。再度ログインしてください",
    });
  });

  it("料理名必須エラーは表示用メッセージにする", async () => {
    vi.mocked(updateRecipeUsecase).mockRejectedValue(
      new Error("RECIPE_TITLE_REQUIRED"),
    );

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "料理名を入力してください",
    });
  });

  it("Error 以外の throw は汎用メッセージ", async () => {
    vi.mocked(updateRecipeUsecase).mockRejectedValue("unexpected");

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "レシピの更新に失敗しました",
    });
  });
});
