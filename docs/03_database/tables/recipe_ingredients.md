# recipe_ingredients テーブル

## 概要

レシピに紐づく材料行（分量・単位・表示順）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 行 ID |
| recipe_id | uuid | NO | - | レシピ ID |
| ingredient_id | uuid | YES | NULL | 材料マスター（任意） |
| name | text | NO | - | 表示用材料名 |
| quantity_display | text | NO | - | 分量の表示文字列 |
| quantity_value | numeric | YES | NULL | 数値分量（任意） |
| unit | text | NO | - | 単位 |
| note | text | YES | NULL | 補足 |
| order_position | integer | NO | - | 表示順（1 始まり） |
| created_at | timestamptz | NO | now() | 作成日時 |

## 主キー

- `id`

## 外部キー

- `recipe_id` → `recipes(id)` ON DELETE CASCADE
- `ingredient_id` → `ingredients(id)` ON DELETE SET NULL

## インデックス

- `(recipe_id, order_position)`
- `ingredient_id`

## 制約

- `order_position > 0`

## RLS

### SELECT

- **users can select accessible recipe ingredients** — `accessible_recipe_ids` 経由

### INSERT

- **authors can insert recipe ingredients** — 対象レシピの作者のみ

### UPDATE

- **authors can update own recipe ingredients** — 対象レシピの作者のみ（`20260913000003`）

### DELETE

- **authors can delete own recipe ingredients** — 対象レシピの作者のみ（`20260913000003`）

## 設計上の補足

一覧・詳細の取得は RLS 付き SELECT。編集時は作者本人のみ DB 上も更新可能。
