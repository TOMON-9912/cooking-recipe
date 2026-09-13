// npm run test:run -- src/app/recipe/[id]/edit/action.test.ts
// npm run test:coverage -- --coverage.include='src/app/recipe/[id]/edit/action.ts' src/app/recipe/[id]/edit/action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { updateRecipeAction } from "./action";
import { createAuthedClient } from "@/lib/supabase/server";
import { updateRecipeUsecase } from "@/usecase/recipe/update-recipe-usecase";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

vi.mock("@/usecase/recipe/update-recipe-usecase", () => ({
  updateRecipeUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/recipe/recipe-repository-impl", () => ({
  updateRecipeWithRelations: vi.fn(),
}));
vi.mock(
  "@/infrastructure/repositories/recipe/recipe-read-repository-impl",
  () => ({ getRecipeById: vi.fn() }),
);
vi.mock("@/infrastructure/storage/recipe-thumbnail-storage-impl", () => ({
  removeRecipeThumbnail: vi.fn(),
}));

describe("updateRecipeAction", () => {
  const formData = {
    id: "recipe-1",
    title: "カレー",
    description: "美味しい",
    servingCount: 2,
    preparationTimeMinutes: 40,
    isDraft: false,
    thumbnailPath: "user-1/a.jpg",
    categoryIds: ["cat-1"],
    ingredients: [{ name: "玉ねぎ", quantity: "2", unit: "個", order: 0 }],
    instructions: [{ stepNumber: 1, description: "切る" }],
  };

  const updatedRecipe = {
    id: "recipe-1",
    title: "カレー",
    description: "美味しい",
    servingCount: 2,
    preparationTimeMinutes: 40,
    isDraft: false,
    ingredients: [],
    instructions: [],
    categories: [],
    authorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAuthedClient).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
  });

  it("成功時は recipe を返す", async () => {
    vi.mocked(updateRecipeUsecase).mockResolvedValue(updatedRecipe);

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({ success: true, recipe: updatedRecipe });
    expect(updateRecipeUsecase).toHaveBeenCalledOnce();
  });

  it("フォームの値をドメインの形へ変換して渡す", async () => {
    vi.mocked(updateRecipeUsecase).mockResolvedValue(updatedRecipe);

    await updateRecipeAction(formData);

    const input = vi.mocked(updateRecipeUsecase).mock.calls[0][0];
    expect(input.actorId).toBe("user-1");
    expect(input.thumbnailPath).toBe("user-1/a.jpg");
    expect(input.categories).toEqual([{ id: "cat-1" }]);
    expect(input.ingredients).toEqual([
      {
        name: "玉ねぎ",
        quantityDisplay: "2",
        quantityValue: 2,
        unit: "個",
        note: undefined,
        order: 0,
      },
    ]);
    expect(input.instructions).toEqual([{ stepNumber: 1, description: "切る" }]);
  });

  it("調理時間は補正せずそのまま渡す", async () => {
    vi.mocked(updateRecipeUsecase).mockResolvedValue(updatedRecipe);

    await updateRecipeAction({ ...formData, preparationTimeMinutes: 0 });

    expect(
      vi.mocked(updateRecipeUsecase).mock.calls[0][0].preparationTimeMinutes,
    ).toBe(0);
  });

  it("成功時は一覧と詳細のキャッシュを更新する", async () => {
    vi.mocked(updateRecipeUsecase).mockResolvedValue(updatedRecipe);

    await updateRecipeAction(formData);

    expect(revalidatePath).toHaveBeenCalledWith("/top");
    expect(revalidatePath).toHaveBeenCalledWith("/recipe/recipe-1");
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

  it("調理時間エラーは表示用メッセージにする", async () => {
    vi.mocked(updateRecipeUsecase).mockRejectedValue(
      new Error("RECIPE_PREPARATION_TIME_INVALID"),
    );

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "調理時間を1分以上で入力してください",
    });
  });

  it("未知のエラーは DB のメッセージを出さない", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(updateRecipeUsecase).mockRejectedValue(
      new Error('relation "recipes" does not exist'),
    );

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "レシピの更新に失敗しました",
    });
    consoleError.mockRestore();
  });

  it("Error 以外の throw は汎用メッセージ", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(updateRecipeUsecase).mockRejectedValue("unexpected");

    const result = await updateRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "レシピの更新に失敗しました",
    });
    consoleError.mockRestore();
  });
});
