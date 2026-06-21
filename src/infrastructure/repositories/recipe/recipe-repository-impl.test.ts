// npm run test:run -- src/infrastructure/repositories/recipe/recipe-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/recipe-repository-impl.ts' src/infrastructure/repositories/recipe/recipe-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { createRecipe } from "./recipe-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

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
});
