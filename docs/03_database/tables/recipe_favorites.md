# recipe_favorites テーブル

## 概要

ユーザーごとのお気に入りレシピ。閲覧権のあるレシピのみ UI でお気に入り可能（参照時は recipes RLS に依存）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| user_id | uuid | NO | - | ユーザー ID |
| recipe_id | uuid | NO | - | レシピ ID |
| created_at | timestamptz | NO | now() | お気に入り登録日時 |

## 主キー

- `(user_id, recipe_id)`

## 外部キー

- `user_id` → `auth.users(id)` ON DELETE CASCADE
- `recipe_id` → `recipes(id)` ON DELETE CASCADE

## インデックス

- `recipe_id` — レシピ単位の集計・逆引き

## 制約

- 同一ユーザーが同一レシピを重複登録不可（複合 PK）

## RLS

### SELECT

- **users can select own favorites** — `user_id = auth.uid()`

### INSERT

- **users can insert own favorites** — `user_id = auth.uid()`

### UPDATE

- ポリシーなし

### DELETE

- **users can delete own favorites** — `user_id = auth.uid()`

## 設計上の補足

お気に入り一覧取得時は `recipes` と JOIN し、削除済み・権限外レシピは結果から除外する。
