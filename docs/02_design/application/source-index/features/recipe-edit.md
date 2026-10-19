# レシピ編集

<!-- ID: recipe-edit / ルート: /recipe/[id]/edit -->

## 更新

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/update-recipe-usecase.ts` | usecase | 専用 | `updateRecipeUsecase` | |
| `src/app/recipe/[id]/edit/action.ts` | action | 専用 | `updateRecipeAction` | |
| `src/app/recipe/[id]/edit/page.tsx` | page | 専用 | | 作者以外 404 |
| `src/presentation/components/recipe/RecipeForm.tsx` | component | 共用 | | `recipe-create` でも使用 |

## データベース

| パス | 種類 | 主要 symbol | 概要 |
| --- | --- | --- | --- |
| `supabase/migrations/20260913000002_update_recipe_with_relations.sql` | migration | `update_recipe_with_relations` | 1 トランザクション更新 |

## 関連ドキュメント

- [update-recipe.md](../../recipes/update-recipe.md)
- [recipe-edit.md](../../../ui/screens/recipe-edit.md)
