# ingredients テーブル

## 概要

材料マスター。`recipe_ingredients.ingredient_id` と任意で紐づけ、将来の材料検索・表記ゆれ統合に使う。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 材料 ID |
| name | text | NO | - | 表示名 |
| normalized_name | text | NO | - | 検索・突合用（正規化済み文字列） |
| created_at | timestamptz | NO | now() | 作成日時 |

## 主キー

- `id`

## 外部キー

- なし

## インデックス

- `normalized_name` UNIQUE

## 制約

- 同一 `normalized_name` の重複登録不可

## RLS

### SELECT

- **authenticated users can select ingredients** — ログイン済みユーザー

### INSERT

- **no direct insert on ingredients** — 常に拒否（サーバー側で正規化して登録）

### UPDATE

- **no direct update on ingredients** — 常に拒否

### DELETE

- **no direct delete on ingredients** — 常に拒否

## 設計上の補足

レシピ上の表示名は `recipe_ingredients.name` に保持し、マスター未紐づけでもレシピ登録できる。
