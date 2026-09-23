# テーブル定義一覧

マイグレーション（`supabase/migrations/`）を正とし、各ファイルでカラム・制約・RLS を記載する。RLS の執筆・更新ポリシーは **`20260913000003_recipe_write_policies_author_only.sql` 適用後**を前提とする。

テーブル間の関係は [ER 図](../er-diagram.md)（[cooking-recipe.dbml](../cooking-recipe.dbml) から自動生成）を参照。

## フォーマット

各ファイルは次の章立てで統一する。

1. 概要
2. カラム定義（表）
3. 主キー
4. 外部キー
5. インデックス
6. 制約
7. RLS（SELECT / INSERT / UPDATE / DELETE）
8. 設計上の補足

## テーブル

| ファイル | オブジェクト | 説明 |
| --- | --- | --- |
| [profiles.md](./profiles.md) | `profiles` | ユーザープロフィール（`auth.users` 1:1） |
| [families.md](./families.md) | `families` | 家族グループ |
| [family_members.md](./family_members.md) | `family_members` | 家族所属 |
| [recipes.md](./recipes.md) | `recipes` | レシピ本体 |
| [categories.md](./categories.md) | `categories` | カテゴリマスター |
| [ingredients.md](./ingredients.md) | `ingredients` | 材料マスター |
| [recipe_categories.md](./recipe_categories.md) | `recipe_categories` | レシピ×カテゴリ |
| [recipe_ingredients.md](./recipe_ingredients.md) | `recipe_ingredients` | レシピ材料 |
| [recipe_instructions.md](./recipe_instructions.md) | `recipe_instructions` | 調理手順 |
| [recipe_favorites.md](./recipe_favorites.md) | `recipe_favorites` | お気に入り |

## ビュー

| ファイル | オブジェクト | 説明 |
| --- | --- | --- |
| [accessible_recipe_ids.md](./accessible_recipe_ids.md) | `accessible_recipe_ids` | RLS 再利用用 |
| [recipe_summaries.md](./recipe_summaries.md) | `recipe_summaries` | 一覧用集約 |

## 関連

- [ER 図](../er-diagram.md)
- [PostgreSQL 型](../postgresql-types-and-settings.md)
- [Storage セキュリティ](../storage-security.md)
- [RLS ヘルパー](../../09_decisions/008-rls-helper-functions.md)
