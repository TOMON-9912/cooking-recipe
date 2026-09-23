---
aside: false
pageClass: er-page
---

# ER 図

`public` スキーマの物理テーブルと、Supabase Auth の `auth.users` との関係。図と一覧は [cooking-recipe.dbml](./cooking-recipe.dbml) から自動生成しているので、DBML を直せばこのページも更新される。

- テーブル名をクリックすると、そのテーブルの定義書（カラム・制約・RLS）を開く
- テーブルにカーソルを合わせると、関連するリレーションと列だけを強調表示する（クリックで固定）
- 線にカーソルを合わせると、FK・多重度・ON DELETE を上部に表示する

## ユーザー・家族

<ErDiagram :columns="[['profiles'], ['auth.users'], ['families', 'family_members']]" />

## レシピ

<ErDiagram
  :columns="[
    ['auth.users', 'recipes'],
    ['recipe_favorites', 'recipe_categories', 'recipe_ingredients', 'recipe_instructions'],
    ['categories', 'ingredients'],
  ]"
/>

## リレーション一覧

<ErRelationTable />

## 図に含めないもの

ビューは物理テーブルではないため図から外している。

| ビュー | 元テーブル | ドキュメント |
| --- | --- | --- |
| `accessible_recipe_ids` | `recipes` | [accessible_recipe_ids.md](./tables/accessible_recipe_ids.md) |
| `recipe_summaries` | `recipes`, `recipe_categories`, `categories` | [recipe_summaries.md](./tables/recipe_summaries.md) |
| `recipe_summaries_with_favorite` | `recipe_summaries`, `recipe_favorites` | [recipe_summaries.md](./tables/recipe_summaries.md) |

## 図を更新する

1. マイグレーションを変更したら、[cooking-recipe.dbml](./cooking-recipe.dbml) の `Table` / `Ref` を合わせて直す
2. `npm run docs:dev` で開いていれば、保存するとこのページに即反映される
3. 新しいテーブルを足したときは、このページの `<ErDiagram :columns="...">` のどこかの列に追加する（配置はここで決める）

配線は隣の列どうし、または同じ列の中だけで引くと見やすい。列を飛ばすリレーションができないように並べる。

dbdiagram.io でも確認・編集したい場合は、DBML をそのまま [dbdiagram.io](https://dbdiagram.io/d) に貼り付ければ同じ定義で開ける。

## 関連

- [テーブル一覧](./tables/README.md)
- [RLS ヘルパー](../09_decisions/008-rls-helper-functions.md)
- [Storage セキュリティ](./storage-security.md)
