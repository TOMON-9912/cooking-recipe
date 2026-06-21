// npm run test:run -- src/infrastructure/repositories/recipe/recipe-read-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/recipe-read-repository-impl.ts' src/infrastructure/repositories/recipe/recipe-read-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import {
  getCategoriesForSearchFilter,
  getRecipeById,
  getRecipeSummaries,
  getRecipeSummariesBySearchQuery,
  getRecipeSummariesWithFavoriteBySearchQuery,
} from "./recipe-read-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
  createClient: vi.fn(),
}));

const summaryRow = {
  id: "recipe-1",
  title: "カレー",
  description: "美味しい",
  thumbnail_url: "path/img.jpg",
  serving_count: 2,
  preparation_time_minutes: 30,
  is_draft: false,
  author_id: "user-1",
  categories: [{ id: "c1", name: "主菜", slug: "main" }],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

describe("recipe-read-repository-impl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getRecipeSummaries は公開済みサマリーを返す", async () => {
    const builder = createQueryBuilder({ data: [summaryRow], error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummaries();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("カレー");
    expect(result[0].thumbnailPath).toBe("path/img.jpg");
  });

  it("getRecipeSummaries は data null なら空配列", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    expect(await getRecipeSummaries()).toEqual([]);
  });

  it("getRecipeById は関連データ付き Recipe を返す", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: null,
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
    const ingredientsBuilder = createQueryBuilder({
      data: [
        {
          id: "ing-1",
          ingredient_id: "master-1",
          name: "玉ねぎ",
          quantity_display: "1",
          quantity_value: 1,
          unit: "個",
          note: null,
          order_position: 1,
        },
      ],
      error: null,
    });
    const instructionsBuilder = createQueryBuilder({
      data: [
        {
          id: "inst-1",
          step_number: 1,
          description: "切る",
          image_url: null,
        },
      ],
      error: null,
    });
    const categoriesBuilder = createQueryBuilder({
      data: [
        {
          categories: { id: "c1", name: "主菜", slug: "main" },
        },
        { categories: null },
      ],
      error: null,
    });

    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_ingredients") return ingredientsBuilder;
      if (table === "recipe_instructions") return instructionsBuilder;
      if (table === "recipe_categories") return categoriesBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    const recipe = await getRecipeById("recipe-1");

    expect(recipe.ingredients).toHaveLength(1);
    expect(recipe.instructions).toHaveLength(1);
    expect(recipe.categories).toHaveLength(1);
    expect(recipe.description).toBe("");
  });

  it("getRecipeById は recipe が null なら RECIPE_NOT_FOUND", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeById("missing")).rejects.toThrow("RECIPE_NOT_FOUND");
  });

  it("getRecipeSummariesBySearchQuery はキーワード一致なしで空配列", async () => {
    const supabase = {
      from: vi.fn(),
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: supabase as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({ keyword: "xyz" });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesBySearchQuery はカテゴリのみで絞り込む", async () => {
    const summariesBuilder = createQueryBuilder({ data: [summaryRow], error: null });
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({
      data: [{ recipe_id: "recipe-1" }],
      error: null,
    });

    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      if (table === "recipe_summaries") return summariesBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from, rpc: vi.fn() } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "",
      categorySlug: "main",
    });

    expect(result).toHaveLength(1);
  });

  it("getRecipeSummariesWithFavoriteBySearchQuery は isFavorited を付与する", async () => {
    const builder = createQueryBuilder({
      data: [{ ...summaryRow, is_favorited: true }],
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder), rpc: vi.fn() } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesWithFavoriteBySearchQuery({
      keyword: "",
    });

    expect(result[0].isFavorited).toBe(true);
  });

  it("getCategoriesForSearchFilter は slug/name を返す", async () => {
    const builder = createQueryBuilder({
      data: [{ slug: "main", name: "主菜" }],
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getCategoriesForSearchFilter();

    expect(result).toEqual([{ slug: "main", name: "主菜" }]);
  });

  it("検索でキーワードとカテゴリの積集合が空なら空配列", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({
      data: [{ recipe_id: "other-id" }],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from,
        rpc: vi.fn().mockResolvedValue({ data: ["recipe-1"], error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "curry",
      categorySlug: "main",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeSummaries は DB エラー時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("db error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeSummaries()).rejects.toThrow("db error");
  });

  it("getRecipeById は recipeError 時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("recipe error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeById("recipe-1")).rejects.toThrow("recipe error");
  });

  it("getRecipeById は ingredients エラー時 throw する", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: "desc",
        thumbnail_url: "thumb.jpg",
        serving_count: 2,
        preparation_time_minutes: 30,
        is_draft: false,
        author_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
      error: null,
    });
    const ingredientsBuilder = createQueryBuilder({
      data: null,
      error: new Error("ingredients error"),
    });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_ingredients") return ingredientsBuilder;
      return createQueryBuilder({ data: [], error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeById("recipe-1")).rejects.toThrow("ingredients error");
  });

  it("getRecipeById は quantity_value null と note/image を正しくマップする", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: null,
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
    const ingredientsBuilder = createQueryBuilder({
      data: [
        {
          id: "ing-1",
          ingredient_id: null,
          name: "塩",
          quantity_display: "少々",
          quantity_value: null,
          unit: "g",
          note: "味見しながら",
          order_position: 1,
        },
      ],
      error: null,
    });
    const instructionsBuilder = createQueryBuilder({
      data: [
        {
          id: "inst-1",
          step_number: 1,
          description: "炒める",
          image_url: "http://img",
        },
      ],
      error: null,
    });
    const categoriesBuilder = createQueryBuilder({ data: [], error: null });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_ingredients") return ingredientsBuilder;
      if (table === "recipe_instructions") return instructionsBuilder;
      if (table === "recipe_categories") return categoriesBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    const recipe = await getRecipeById("recipe-1");

    expect(recipe.ingredients[0].quantityValue).toBeUndefined();
    expect(recipe.ingredients[0].note).toBe("味見しながら");
    expect(recipe.instructions[0].imageUrl).toBe("http://img");
  });

  it("getRecipeSummariesBySearchQuery はキーワードのみで検索する", async () => {
    const summariesBuilder = createQueryBuilder({ data: [summaryRow], error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(summariesBuilder),
        rpc: vi.fn().mockResolvedValue({ data: ["recipe-1"], error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({ keyword: "カレー" });

    expect(result).toHaveLength(1);
    expect(summariesBuilder.in).toHaveBeenCalledWith("id", ["recipe-1"]);
  });

  it("getRecipeSummariesBySearchQuery は RPC エラー時 throw する", async () => {
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn(),
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("rpc error"),
        }),
      } as never,
      user: { id: "user-1" } as never,
    });

    await expect(
      getRecipeSummariesBySearchQuery({ keyword: "curry" }),
    ).rejects.toThrow("rpc error");
  });

  it("getRecipeSummariesBySearchQuery は存在しないカテゴリ slug で空配列", async () => {
    const categoriesBuilder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(categoriesBuilder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "",
      categorySlug: "unknown",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesBySearchQuery はカテゴリに紐づくレシピがなければ空配列", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({ data: [], error: null });
    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from, rpc: vi.fn() } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "",
      categorySlug: "main",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesBySearchQuery は検索結果 data null なら空配列", async () => {
    const summariesBuilder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(summariesBuilder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({ keyword: "" });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesWithFavoriteBySearchQuery はキーワードで in フィルタする", async () => {
    const builder = createQueryBuilder({
      data: [{ ...summaryRow, is_favorited: false }],
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(builder),
        rpc: vi.fn().mockResolvedValue({ data: ["recipe-1"], error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesWithFavoriteBySearchQuery({
      keyword: "カレー",
    });

    expect(result).toHaveLength(1);
    expect(builder.in).toHaveBeenCalledWith("id", ["recipe-1"]);
    expect(result[0].isFavorited).toBe(false);
  });

  it("getRecipeSummariesWithFavoriteBySearchQuery は DB エラー時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("view error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(builder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    await expect(
      getRecipeSummariesWithFavoriteBySearchQuery({ keyword: "" }),
    ).rejects.toThrow("view error");
  });

  it("getCategoriesForSearchFilter は data null なら空配列", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    expect(await getCategoriesForSearchFilter()).toEqual([]);
  });

  it("getRecipeById は instructions エラー時 throw する", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: null,
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
    const instructionsBuilder = createQueryBuilder({
      data: null,
      error: new Error("instructions error"),
    });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_instructions") return instructionsBuilder;
      return createQueryBuilder({ data: [], error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeById("recipe-1")).rejects.toThrow(
      "instructions error",
    );
  });

  it("getRecipeById は categories エラー時 throw する", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: null,
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
    const categoriesBuilder = createQueryBuilder({
      data: null,
      error: new Error("categories error"),
    });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_categories") return categoriesBuilder;
      return createQueryBuilder({ data: [], error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getRecipeById("recipe-1")).rejects.toThrow("categories error");
  });

  it("getRecipeSummariesBySearchQuery はカテゴリ取得エラー時 throw する", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: null,
      error: new Error("cat error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(categoriesBuilder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    await expect(
      getRecipeSummariesBySearchQuery({ keyword: "", categorySlug: "main" }),
    ).rejects.toThrow("cat error");
  });

  it("getRecipeSummariesBySearchQuery はカテゴリ紐付けエラー時 throw する", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({
      data: null,
      error: new Error("link error"),
    });
    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from, rpc: vi.fn() } as never,
      user: { id: "user-1" } as never,
    });

    await expect(
      getRecipeSummariesBySearchQuery({ keyword: "", categorySlug: "main" }),
    ).rejects.toThrow("link error");
  });

  it("getRecipeSummariesBySearchQuery はクエリエラー時 throw する", async () => {
    const summariesBuilder = createQueryBuilder({
      data: null,
      error: new Error("query error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(summariesBuilder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    await expect(
      getRecipeSummariesBySearchQuery({ keyword: "" }),
    ).rejects.toThrow("query error");
  });

  it("getRecipeSummariesBySearchQuery はキーワードとカテゴリの積集合で絞り込む", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({
      data: [{ recipe_id: "recipe-1" }],
      error: null,
    });
    const summariesBuilder = createQueryBuilder({ data: [summaryRow], error: null });
    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      if (table === "recipe_summaries") return summariesBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from,
        rpc: vi.fn().mockResolvedValue({ data: ["recipe-1"], error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "カレー",
      categorySlug: "main",
    });

    expect(result).toHaveLength(1);
  });

  it("getRecipeSummaries は categories null の行を空配列にする", async () => {
    const builder = createQueryBuilder({
      data: [{ ...summaryRow, categories: null }],
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummaries();

    expect(result[0].categories).toEqual([]);
  });

  it("getRecipeSummariesWithFavoriteBySearchQuery は一致なしなら空配列", async () => {
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn(),
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesWithFavoriteBySearchQuery({
      keyword: "xyz",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesWithFavoriteBySearchQuery は data null なら空配列", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn().mockReturnValue(builder),
        rpc: vi.fn(),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesWithFavoriteBySearchQuery({
      keyword: "",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeSummariesBySearchQuery はカテゴリ紐付け data null を空配列扱いする", async () => {
    const categoriesBuilder = createQueryBuilder({
      data: { id: "cat-1" },
      error: null,
    });
    const linksBuilder = createQueryBuilder({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "categories") return categoriesBuilder;
      if (table === "recipe_categories") return linksBuilder;
      return createQueryBuilder({ data: null, error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from, rpc: vi.fn() } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({
      keyword: "",
      categorySlug: "main",
    });

    expect(result).toEqual([]);
  });

  it("getRecipeById は ingredientId と thumbnailPath をマップする", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: "説明",
        thumbnail_url: "thumb.jpg",
        serving_count: 2,
        preparation_time_minutes: 30,
        is_draft: false,
        author_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
      error: null,
    });
    const ingredientsBuilder = createQueryBuilder({
      data: [
        {
          id: "ing-1",
          ingredient_id: "master-1",
          name: "玉ねぎ",
          quantity_display: "1",
          quantity_value: 1,
          unit: "個",
          note: null,
          order_position: 1,
        },
      ],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      if (table === "recipe_ingredients") return ingredientsBuilder;
      return createQueryBuilder({ data: [], error: null });
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    const recipe = await getRecipeById("recipe-1");

    expect(recipe.thumbnailPath).toBe("thumb.jpg");
    expect(recipe.ingredients[0].ingredientId).toBe("master-1");
    expect(recipe.ingredients[0].quantityValue).toBe(1);
  });

  it("getRecipeSummaries は description/thumbnail が null の行をマップする", async () => {
    const builder = createQueryBuilder({
      data: [
        {
          ...summaryRow,
          description: null,
          thumbnail_url: null,
        },
      ],
      error: null,
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummaries();

    expect(result[0].description).toBe("");
    expect(result[0].thumbnailPath).toBeUndefined();
  });

  it("getRecipeSummariesBySearchQuery は RPC data null を空配列扱いする", async () => {
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: {
        from: vi.fn(),
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as never,
      user: { id: "user-1" } as never,
    });

    const result = await getRecipeSummariesBySearchQuery({ keyword: "curry" });

    expect(result).toEqual([]);
  });

  it("getRecipeById は関連 data が null でも空配列で返す", async () => {
    const recipeBuilder = createQueryBuilder({
      data: {
        id: "recipe-1",
        title: "カレー",
        description: null,
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
    const nullDataBuilder = createQueryBuilder({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "recipes") return recipeBuilder;
      return nullDataBuilder;
    });

    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-1" } as never,
    });

    const recipe = await getRecipeById("recipe-1");

    expect(recipe.ingredients).toEqual([]);
    expect(recipe.instructions).toEqual([]);
    expect(recipe.categories).toEqual([]);
  });

  it("getCategoriesForSearchFilter は DB エラー時 throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("cat error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(getCategoriesForSearchFilter()).rejects.toThrow("cat error");
  });
});
