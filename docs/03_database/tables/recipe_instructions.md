# recipe_instructions テーブル

## 概要

レシピの調理手順（ステップ番号・説明・任意のステップ画像パス）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 手順 ID |
| recipe_id | uuid | NO | - | レシピ ID |
| step_number | integer | NO | - | ステップ番号（1 始まり） |
| description | text | NO | - | 手順本文 |
| image_url | text | YES | NULL | ステップ画像（Storage パス） |
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

手順画像も Storage に保存し、本テーブルにはパスのみ保持する。
