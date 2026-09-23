# レシピ API（Server Actions）

## 作成

- ルート: `/recipe/new`
- Action: `src/app/recipe/new/action.ts`
- Usecase: `createRecipeUsecase`

## 更新

- ルート: `/recipe/[id]/edit`
- Action: `src/app/recipe/[id]/edit/action.ts`
- Usecase: `updateRecipeUsecase`
- 詳細: [application/recipes/update-recipe.md](../04_application/recipes/update-recipe.md)

## サムネイル

- Action: `uploadRecipeThumbnailAction`（作成・編集共通）
- Storage: [database/storage-security.md](../03_database/storage-security.md)
