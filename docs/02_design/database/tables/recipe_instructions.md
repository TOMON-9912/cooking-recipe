# recipe_instructions テーブル

## 概要

レシピの調理手順（ステップ番号と説明）。`image_url` は将来の手順画像パス用に残し、現在は使わない。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 手順 ID |
| recipe_id | uuid | NO | - | レシピ ID |
| step_number | integer | NO | - | ステップ番号（1 始まり） |
| description | text | NO | - | 手順本文 |
| image_url | text | YES | NULL | 手順画像の Storage パス。現在は保存しない |
| created_at | timestamptz | NO | now() | 作成日時 |

## 主キー

- `id`

## 外部キー

- `recipe_id` → `recipes(id)` ON DELETE CASCADE

## インデックス

- `(recipe_id, step_number)` UNIQUE（複合 UNIQUE によりインデックス自動作成）

## 制約

- `step_number > 0`
- 同一レシピ内で `step_number` は一意

## RLS

### SELECT

- **users can select accessible recipe instructions** — `accessible_recipe_ids` 経由

### INSERT

- **authors can insert recipe instructions** — 対象レシピの作者のみ

### UPDATE

- **authors can update own recipe instructions** — 対象レシピの作者のみ（`20260913000003`）

### DELETE

- **authors can delete own recipe instructions** — 対象レシピの作者のみ（`20260913000003`）

## 設計上の補足

`image_url` は削除しない（[レシピ手順の画像追加機能の削除](../../../01_requirements/recipe-instruction-image.md) の R-02）。手順の画像ファイルは Storage に保存せず、作成・更新でもこの列へパスを書かない。レシピ本体のサムネイルは `recipes.thumbnail_url` であり、この列とは別である。
