# レシピ作成

## 仕様

ログインユーザーが、新しいレシピを下書きまたは公開として残せる。

## スコープ

### 含める

- 料理名・人数・時間・説明・材料・手順・カテゴリ・サムネイルの新規保存

### 含めない

- 更新（[update-recipe.md](./update-recipe.md)）
- 削除、手順画像の Storage 保存

## 設計

### 各層の流れ

```text
recipe/new/page.tsx
  → RecipeForm
    → createRecipeAction
      → createRecipeUsecase（validateRecipeContent）
        → createRecipe + saveIngredients / saveInstructions / saveCategories
```

| 層 | パス | 役割 |
| --- | --- | --- |
| usecase | `src/usecase/recipe/create-recipe-usecase.ts` | 検証と本体・関連の保存 |
| app | `src/app/recipe/new/action.ts` | `createRecipeAction`。deps 組み立て |
| presentation | `src/presentation/components/recipe/RecipeForm.tsx` | 作成モード。成功時 `/recipe/{id}` へ |

入口は `/recipe/new`。作成時の関連保存は並列 `Promise.all`。更新のような 1 RPC にはしていない。

サムネイルは [upload-recipe-thumbnail.md](./upload-recipe-thumbnail.md)。

## 関連

| 種類 | リンク |
| --- | --- |
| ドメイン | [recipe.md](../../domain/recipe.md) |
| 画面 | [recipe-new.md](../../ui/screens/recipe-new.md) |
| テスト設計 | [create-recipe.md](../../../03_test/design/recipes/create-recipe.md) |
