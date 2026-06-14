// npm run test:run -- src/infrastructure/repositories/recipe/favorite-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/favorite-repository-impl.ts' src/infrastructure/repositories/recipe/favorite-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import {
  addFavorite,
  getFavoriteRecipeIds,
  removeFavorite,
} from "./favorite-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

describe("favorite-repository-impl", () => {
  const user = { id: "user-1" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getFavoriteRecipeIds は recipe_id 配列を返す", async () => {
    const builder = createQueryBuilder({
      data: [{ recipe_id: "r1" }, { recipe_id: "r2" }],
      error: null,
    });
    const supabase = { from: vi.fn().mockReturnValue(builder) };
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: supabase as never,
      user: user as never,
    });

    const ids = await getFavoriteRecipeIds();

    expect(ids).toEqual(["r1", "r2"]);
    expect(supabase.from).toHaveBeenCalledWith("recipe_favorites");
  });

  it("addFavorite は insert を呼ぶ", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue(builder) };
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: supabase as never,
      user: user as never,
    });

    await addFavorite("recipe-1");

    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      recipe_id: "recipe-1",
    });
  });

  it("removeFavorite は delete を呼ぶ", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue(builder) };
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: supabase as never,
      user: user as never,
    });

    await removeFavorite("recipe-1");

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.eq).toHaveBeenCalledWith("recipe_id", "recipe-1");
  });

  it("getFavoriteRecipeIds は data null なら空配列", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: user as never,
    });

    expect(await getFavoriteRecipeIds()).toEqual([]);
  });

  it("addFavorite は DB エラー時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("insert failed"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: user as never,
    });

    await expect(addFavorite("recipe-1")).rejects.toThrow("insert failed");
  });

  it("removeFavorite は DB エラー時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("delete failed"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: user as never,
    });

    await expect(removeFavorite("recipe-1")).rejects.toThrow("delete failed");
  });

  it("DB エラー時は throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("db error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: user as never,
    });

    await expect(getFavoriteRecipeIds()).rejects.toThrow("db error");
  });
});
