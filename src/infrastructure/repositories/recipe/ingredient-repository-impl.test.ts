// npm run test:run -- src/infrastructure/repositories/recipe/ingredient-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/ingredient-repository-impl.ts' src/infrastructure/repositories/recipe/ingredient-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { saveIngredients } from "./ingredient-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

describe("ingredient-repository-impl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saveIngredients は insert を呼ぶ", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await saveIngredients("recipe-1", [
      {
        name: "玉ねぎ",
        quantityDisplay: "1個",
        unit: "個",
        order: 0,
      },
    ]);

    expect(builder.insert).toHaveBeenCalledWith([
      {
        recipe_id: "recipe-1",
        ingredient_id: null,
        name: "玉ねぎ",
        quantity_display: "1個",
        quantity_value: null,
        unit: "個",
        note: null,
        order_position: 1,
      },
    ]);
  });

  it("DB エラー時は throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("db error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(saveIngredients("recipe-1", [])).rejects.toThrow("db error");
  });
});
