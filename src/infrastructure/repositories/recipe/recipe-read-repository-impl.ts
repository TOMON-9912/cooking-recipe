import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeSearchQuery } from "@/domain/models/recipe/recipe-search-query";
import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * 公開済みレシピのサマリー一覧を取得する。
 * recipe_summaries ビューを使用（N+1 問題を回避）。
 */
export const getRecipeSummaries = async (): Promise<RecipeSummary[]> => {
  const { supabase } = await createAuthedClient();

  const { data, error } = await supabase
    .from("recipe_summaries")
    .select("*")
    .eq("is_draft", false)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    thumbnailPath: row.thumbnail_url ?? undefined,
    servingCount: row.serving_count,
    preparationTimeMinutes: row.preparation_time_minutes,
    isDraft: row.is_draft,
    authorId: row.author_id,
    categories:
      (row.categories as Array<{
        id: string;
        name: string;
        slug: string;
      }>) ?? [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
};

/**
 * レシピ 1 件を全関連データ付きで取得する。
 * recipes + recipe_ingredients + recipe_instructions + recipe_categories を並列取得。
 */
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const { supabase } = await createAuthedClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (recipeError) throw recipeError;
  if (!recipe) throw new Error("RECIPE_NOT_FOUND");

  const [ingredientsResult, instructionsResult, categoriesResult] =
    await Promise.all([
      supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", id)
        .order("order_position"),
      supabase
        .from("recipe_instructions")
        .select("*")
        .eq("recipe_id", id)
        .order("step_number"),
      supabase
        .from("recipe_categories")
        .select("category_id, categories(id, name, slug)")
        .eq("recipe_id", id),
    ]);

  if (ingredientsResult.error) throw ingredientsResult.error;
  if (instructionsResult.error) throw instructionsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? "",
    thumbnailPath: recipe.thumbnail_url ?? undefined,
    servingCount: recipe.serving_count,
    preparationTimeMinutes: recipe.preparation_time_minutes,
    isDraft: recipe.is_draft,
    authorId: recipe.author_id,
    ingredients: (ingredientsResult.data ?? []).map((row) => ({
      id: row.id,
      ingredientId: row.ingredient_id ?? undefined,
      name: row.name,
      quantityDisplay: row.quantity_display,
      quantityValue:
        row.quantity_value != null ? Number(row.quantity_value) : undefined,
      unit: row.unit,
      note: row.note ?? undefined,
      order: row.order_position - 1,
    })),
    instructions: (instructionsResult.data ?? []).map((row) => ({
      id: row.id,
      stepNumber: row.step_number,
      description: row.description,
      imageUrl: row.image_url ?? undefined,
    })),
    categories: (categoriesResult.data ?? [])
      .filter((row) => row.categories != null)
      .map((row) => {
        const cat = row.categories as unknown as {
          id: string;
          name: string;
          slug: string;
        };
        return { id: cat.id, name: cat.name, slug: cat.slug };
      }),
    createdAt: new Date(recipe.created_at),
    updatedAt: new Date(recipe.updated_at),
  };
};

/**
 * レシピ検索
 */
export const getRecipeSummariesBySearchQuery = async (
  query:RecipeSearchQuery
): Promise<RecipeSummary[]> => {
  // supabase接続
  const { supabase } = await createAuthedClient();

  // 定数
  const keyword = query.keyword.trim();

  // カテゴリ検索用ID
  let recipeIds : string[] | null = null;

  // メインクエリ
  let builder = supabase
    .from("recipe_summaries")
    .select("*")
    .eq("is_draft",false);

  // キーワード検索
  if(keyword.length > 0) {
    const pattern = `%${keyword}%`;
    // 部分一致
    builder = builder.or(
      `title.ilike.${pattern},description.ilike.${pattern}`,
    );
  }

  // カテゴリ検索実施チェック
  if(query.categorySlug) {
    const { data : cat , error : catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug" , query.categorySlug)
      .maybeSingle();

    if(catError) throw catError;
    if(!cat) return [];

    const { data : links, error : linkError } = await supabase  
      .from("recipe_categories")
      .select("recipe_id")
      .eq("category_id" , cat.id );
    
    if(linkError) throw linkError;
    recipeIds = [...new Set((links ?? []).map((r) => r.recipe_id))];
    if(recipeIds.length === 0) return [];
  }

  // カテゴリ検索
  if(recipeIds) {
    builder = builder.in("id", recipeIds);
  }

  // 検索処理
  const { data , error } = await builder.order("updated_at", {
    ascending:false,
  });

  if(error) throw error;
  if(!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    thumbnailPath: row.thumbnail_url ?? undefined,
    servingCount: row.serving_count,
    preparationTimeMinutes: row.preparation_time_minutes,
    isDraft: row.is_draft,
    authorId: row.author_id,
    categories:
      (row.categories as Array<{
        id: string;
        name: string;
        slug: string;
      }>) ?? [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

