# レシピ一覧取得

## 仕様

ログインユーザーが見られるレシピの要約一覧を、自分のお気に入り印付きで取得できる。

## スコープ

### 含める

- `/top` の一覧
- お気に入りフラグの付与

### 含めない

- キーワード・カテゴリ検索（[search-recipe-summaries.md](./search-recipe-summaries.md)）

## 設計

```text
top/page.tsx
  → getRecipeSummariesUsecase
    → getRecipeSummaries と getFavoriteRecipeIds を並列
      → isFavorited を付与
```

| 層 | パス | 役割 |
| --- | --- | --- |
| usecase | `src/usecase/recipe/get-recipe-summaries-usecase.ts` | 一覧と印の合成 |
| page | `src/app/top/page.tsx` | 署名 URL、ヒーロー |

可視性は `recipe_summaries` と RLS。お気に入りの意味は [favorite.md](../../domain/favorite.md)。

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [top.md](../../ui/screens/top.md) |
| お気に入り切替 | [toggle-favorite.md](./toggle-favorite.md) |
| テスト設計 | [get-recipe-summaries.md](../../../03_test/design/recipes/get-recipe-summaries.md) |
