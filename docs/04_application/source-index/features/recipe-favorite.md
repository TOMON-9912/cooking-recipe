# お気に入り切替

<!-- ID: recipe-favorite / 入口: /top のカード -->

## 切替

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/toggle-favorite-usecase.ts` | usecase | 専用 | `toggleFavoriteUsecase` | |
| `src/app/top/action.ts` | action | 共用 | `toggleFavoriteAction` | `recipe-top` の画面から呼ぶ |
| `src/infrastructure/repositories/recipe/favorite-repository-impl.ts` | repository | 専用 | | |
| `src/presentation/components/recipe/FavoriteButton.tsx` | component | 専用 | `FavoriteButton` | |

## データベース

| パス | 種類 | 主要 symbol | 概要 |
| --- | --- | --- | --- |
| `supabase/migrations/20260314000001_create_recipe_favorites.sql` | migration | `recipe_favorites` | |

## 関連ドキュメント

- [toggle-favorite.md](../../recipes/toggle-favorite.md)
- [favorite.md](../../../02_domain/favorite.md)
