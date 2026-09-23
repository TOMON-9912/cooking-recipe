# recipe_categories テーブル

## 概要

レシピとカテゴリの中間テーブル（多対多）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| recipe_id | uuid | NO | - | レシピ ID |
| category_id | uuid | NO | - | カテゴリ ID |
| created_at | timestamptz | NO | now() | 紐付け日時 |

## 主キー

- `(recipe_id, category_id)`

## 外部キー

- `recipe_id` → `recipes(id)` ON DELETE CASCADE
- `category_id` → `categories(id)` ON DELETE CASCADE

## インデックス

- `category_id` — カテゴリからの逆引き

## 制約

- 同一レシピに同一カテゴリは 1 行のみ（複合 PK）

## RLS

### SELECT

- **users can select accessible recipe categories** — `recipe_id` が `accessible_recipe_ids` に含まれる

### INSERT

- **authors can insert recipe categories** — 対象レシピの `author_id = auth.uid()`

### UPDATE

- ポリシーなし

### DELETE

- **authors can delete own recipe categories** — 対象レシピの作者のみ（`20260913000003`。以前は閲覧可能なら誰でも削除可だった）

## 設計上の補足

更新は DELETE + INSERT または RPC 経由の一括置換で行う。
