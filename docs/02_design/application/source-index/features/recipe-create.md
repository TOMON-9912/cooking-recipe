# レシピ登録

<!-- ID: recipe-create / ルート: /recipe/new -->

## 作成

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/create-recipe-usecase.ts` | usecase | 専用 | `createRecipeUsecase` | |
| `src/usecase/recipe/recipe-input-validation.ts` | usecase | 共用 | `validateRecipeContent` | 更新でも使用 |
| `src/app/recipe/new/action.ts` | action | 専用 | `createRecipeAction` | |
| `src/app/recipe/new/page.tsx` | page | 専用 | | |
| `src/presentation/components/recipe/RecipeForm.tsx` | component | 共用 | `RecipeForm` | `recipe-edit` でも使用 |

## サムネイル

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/recipe/upload-recipe-thumbnail-usecase.ts` | usecase | 共用 | | `recipe-edit` でも使用 |
| `src/app/recipe/new/upload-recipe-thumbnail-action.ts` | action | 共用 | | |

## 関連ドキュメント

- [create-recipe.md](../../recipes/create-recipe.md)
- [recipe-new.md](../../../ui/screens/recipe-new.md)
