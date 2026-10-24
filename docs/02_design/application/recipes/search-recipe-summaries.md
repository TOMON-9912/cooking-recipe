# レシピ検索

## 仕様

キーワードとカテゴリで、見られるレシピの要約を絞り込める。

## スコープ

### 含める

- `/recipe/search` の GET 検索
- タイトル・説明の部分一致（材料横断は第 2 段階）

### 含めない

- 材料名での横断検索
- TOP の無条件一覧（[get-recipe-summaries.md](./get-recipe-summaries.md)）

## 設計

```text
recipe/search/page.tsx
  → searchRecipeSummariesUsecase
    → resolveSearchRecipeSummaryIds（RPC + カテゴリ）
    → recipe_summaries_with_favorite
```

キーワードの `%` は ILIKE にせず `strpos` RPC（`recipe_summaries_ids_matching_keyword`）。画面仕様は [recipe-search.md](../../ui/screens/recipe-search.md) と [recipe-search-keyword.md](../../ui/screens/recipe-search-keyword.md)。

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [recipe-search.md](../../ui/screens/recipe-search.md) |
| ビュー | [recipe_summaries.md](../../database/tables/recipe_summaries.md) |
| テスト設計 | [search-recipe-summaries.md](../../../03_test/design/recipes/search-recipe-summaries.md) |
