// npm run test:run -- src/infrastructure/repositories/recipe/category-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/category-repository-impl.ts' src/infrastructure/repositories/recipe/category-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { saveCategories } from "./category-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

describe("category-repository-impl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saveCategories は insert を呼ぶ", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await saveCategories("recipe-1", [
      { id: "cat-1", name: "主菜", slug: "main" },
    ]);

    expect(builder.insert).toHaveBeenCalledWith([
      { recipe_id: "recipe-1", category_id: "cat-1" },
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

    await expect(saveCategories("recipe-1", [])).rejects.toThrow("db error");
  });
});
