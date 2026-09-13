// npm run test:run -- src/infrastructure/repositories/recipe/recipe-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/recipe-repository-impl.ts' src/infrastructure/repositories/recipe/recipe-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { createRecipe, updateRecipeWithRelations } from "./recipe-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";
import type {
  RecipeInput,
  UpdateRecipeInput,
} from "@/domain/repositories/recipe/recipe-repository";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

const recipeRow = {
  id: "recipe-1",
  title: "更新後",
  description: "新しい説明",
  thumbnail_url: "user-1/a.jpg",
  serving_count: 4,
  preparation_time_minutes: 20,
  is_draft: true,
  author_id: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-03T00:00:00Z",
};

/**
 * rpc を差し替えた Supabase クライアントをモックする。
 *
 * @param result rpc の戻り値
 * @returns rpc のモック関数
 */
const mockRpc = (result: { data: unknown; error: Error | null }) => {
  const rpc = vi.fn().mockResolvedValue(result);
  vi.mocked(createAuthedClient).mockResolvedValue({
    supabase: { rpc } as never,
    user: { id: "user-1" } as never,
  });
  return rpc;
};

describe("recipe-repository-impl", () => {
  const input: RecipeInput = {
    id: "recipe-1",
    title: "テスト",
    description: "説明",
    servingCount: 2,
    preparationTimeMinutes: 30,
    isDraft: false,
    ingredients: [],
    instructions: [],
    categories: [],
    authorId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecipe は Recipe を返す", async () => {
    const builder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "テスト",
        description: "説明",
        thumbnail_url: null,
        serving_count: 2,
        preparation_time_minutes: 30,
        is_draft: false,
        author_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    const recipe = await createRecipe(input);

    expect(recipe.id).toBe("recipe-1");
    expect(recipe.title).toBe("テスト");
    expect(builder.insert).toHaveBeenCalled();
  });

  it("insert が data null なら INSERT_FAILED", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(createRecipe(input)).rejects.toThrow("INSERT_FAILED");
  });

  it("DB エラー時は throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("insert failed"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(createRecipe(input)).rejects.toThrow("insert failed");
  });

  const updateInput: UpdateRecipeInput = {
    id: "recipe-1",
    title: "更新後",
    description: "新しい説明",
    thumbnailPath: "user-1/a.jpg",
    servingCount: 4,
    preparationTimeMinutes: 20,
    isDraft: true,
    ingredients: [
      {
        name: "玉ねぎ",
        quantityDisplay: "1",
        quantityValue: 1,
        unit: "個",
        note: "みじん切り",
        order: 0,
      },
    ],
    instructions: [{ stepNumber: 1, description: "切る" }],
    categories: [{ id: "cat-1" }],
  };

  it("updateRecipeWithRelations は RPC の結果を Recipe にして返す", async () => {
    const rpc = mockRpc({ data: recipeRow, error: null });

    const recipe = await updateRecipeWithRelations(updateInput);

    expect(recipe.title).toBe("更新後");
    expect(recipe.thumbnailPath).toBe("user-1/a.jpg");
    expect(rpc).toHaveBeenCalledWith("update_recipe_with_relations", {
      p_recipe_id: "recipe-1",
      p_title: "更新後",
      p_description: "新しい説明",
      p_thumbnail_url: "user-1/a.jpg",
      p_serving_count: 4,
      p_preparation_time_minutes: 20,
      p_is_draft: true,
      p_ingredients: [
        {
          name: "玉ねぎ",
          quantity_display: "1",
          quantity_value: 1,
          unit: "個",
          note: "みじん切り",
          order_position: 1,
        },
      ],
      p_instructions: [
        { step_number: 1, description: "切る", image_url: null },
      ],
      p_category_ids: ["cat-1"],
    });
  });

  it("サムネイル削除は thumbnail_url に null を送る", async () => {
    const rpc = mockRpc({
      data: { ...recipeRow, thumbnail_url: null },
      error: null,
    });

    const recipe = await updateRecipeWithRelations({
      ...updateInput,
      thumbnailPath: null,
    });

    expect(rpc.mock.calls[0][1]).toMatchObject({ p_thumbnail_url: null });
    expect(recipe.thumbnailPath).toBeUndefined();
  });

  it("作者を差し替える項目は送らない", async () => {
    const rpc = mockRpc({ data: recipeRow, error: null });

    await updateRecipeWithRelations(updateInput);

    expect(rpc.mock.calls[0][1]).not.toHaveProperty("p_author_id");
  });

  it("RPC が data null なら UPDATE_FAILED", async () => {
    mockRpc({ data: null, error: null });

    await expect(updateRecipeWithRelations(updateInput)).rejects.toThrow(
      "UPDATE_FAILED",
    );
  });

  it("RPC の DB エラー時は throw する", async () => {
    mockRpc({ data: null, error: new Error("update failed") });

    await expect(updateRecipeWithRelations(updateInput)).rejects.toThrow(
      "update failed",
    );
  });
});
