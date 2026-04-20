"use client";

import Link from "next/link";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";
import { RecipeListPage } from "./RecipeListPage";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type CategoryOption = {
  slug: string;
  name: string;
};

type Props = {
  recipes: RecipeSummaryWithFavorite[];
  initialKeyword: string;
  initialCategorySlug?: string;
  categoryOptions: CategoryOption[];
};

export function RecipeSearchPage({
  recipes,
  initialKeyword,
  initialCategorySlug,
  categoryOptions,
}: Props) {
  const formKey = `${initialKeyword}\0${initialCategorySlug ?? ""}`;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          条件を入れてレシピを探す
        </h1>
        <p className="text-sm text-gray-500">
          キーワードはタイトル・説明に含まれるものを表示します。カテゴリは任意です。
        </p>
      </header>

      <form
        key={formKey}
        method="get"
        action="/recipe/search"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        <div className="space-y-2">
          <label
            htmlFor="search-q"
            className="text-sm font-medium text-gray-700"
          >
            キーワード
          </label>
          <Input
            id="search-q"
            name="q"
            type="search"
            defaultValue={initialKeyword}
            placeholder="例: カレー、スープ"
            className="rounded-md"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="search-category"
            className="text-sm font-medium text-gray-700"
          >
            カテゴリ（任意）
          </label>
          <select
            id="search-category"
            name="category"
            defaultValue={initialCategorySlug ?? ""}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="">指定なし</option>
            {categoryOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
          >
            <Search className="w-5 h-5" />
            検索する
          </button>
        </div>
      </form>

      <section className="space-y-4" aria-live="polite">
        <h2 className="text-lg font-semibold text-gray-900">検索結果</h2>
        {recipes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-gray-700 font-medium">
                条件に一致するレシピがありませんでした
              </p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                別のキーワードやカテゴリを試すか、トップの一覧から探してみてください。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  href="/recipe/search"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                >
                  条件をクリア
                </Link>
                <Link
                  href="/top"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                >
                  トップへ
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <RecipeListPage recipes={recipes} />
        )}
      </section>
    </div>
  );
}
