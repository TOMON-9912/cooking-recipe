# お気に入り切替

## 仕様

ログインユーザーが、見られるレシピのお気に入りを付け外しできる。

## スコープ

### 含める

- `toggleFavoriteAction`（`/top` から）
- 付いていれば外し、無ければ付ける

### 含めない

- お気に入り専用一覧画面
- 他人の印の閲覧

## 設計

```text
top/action.ts（toggleFavoriteAction）
  → toggleFavoriteUsecase
    → getFavoriteRecipeIds のあとに add または remove
```

| 層 | パス | 役割 |
| --- | --- | --- |
| usecase | `src/usecase/recipe/toggle-favorite-usecase.ts` | トグル |
| app | `src/app/top/action.ts` | deps、revalidate |

ドメインは [favorite.md](../../domain/favorite.md)。

## 関連

| 種類 | リンク |
| --- | --- |
| テーブル | [recipe_favorites.md](../../database/tables/recipe_favorites.md) |
| 画面 | [top.md](../../ui/screens/top.md) |
| テスト設計 | [toggle-favorite.md](../../../03_test/design/recipes/toggle-favorite.md) |
