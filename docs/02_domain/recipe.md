# レシピドメイン

## 概念

- **レシピ（recipes）**: 作者が所有。公開 / 下書き、サムネイル、調理時間・人数など
- **材料・手順・カテゴリ**: レシピに従属。更新時はトランザクション内で置き換え（RPC）
- **検索**: キーワードマッチング（`recipe_summaries` ビュー + RPC）

## 関連

- DB: [database/tables/recipes.md](../03_database/tables/recipes.md)
- 画面: [ui/screens/recipe-search.md](../06_ui/screens/recipe-search.md)
- ユースケース: [application/recipes/update-recipe.md](../04_application/recipes/update-recipe.md)
- ADR: [008 画像保存先](../09_decisions/008-image-storage.md)
