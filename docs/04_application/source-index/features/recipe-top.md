# TOP・一覧

<!-- ID: recipe-top / ルート: /top -->

## 一覧取得

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/get-recipe-summaries-usecase.ts` | usecase | 専用 | `getRecipeSummariesUsecase` | サマリーにお気に入りを付ける |
| `src/infrastructure/repositories/recipe/recipe-read-repository-impl.ts` | repository | 共用 | `getRecipeSummaries` | ビューから一覧 |
| `src/app/top/page.tsx` | page | 専用 | | 署名 URL、ヒーロー |

## お気に入り

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/toggle-favorite-usecase.ts` | usecase | 共用 | `toggleFavoriteUsecase` | `recipe-favorite` でも使用 |
| `src/app/top/action.ts` | action | 専用 | `toggleFavoriteAction` | |

## 画面

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/presentation/components/recipe/TopHero.tsx` | component | 専用 | | |
| `src/presentation/components/recipe/RecipeListPage.tsx` | component | 共用 | | `recipe-search` でも使用 |
| `src/app/top/logout-action.ts` | action | 導線のみ | `logoutAction` | `auth` 側 |

## 関連ドキュメント

- [get-recipe-summaries.md](../../recipes/get-recipe-summaries.md)
- [top.md](../../../06_ui/screens/top.md)
