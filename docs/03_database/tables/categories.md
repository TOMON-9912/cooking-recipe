# categories テーブル

## 概要

レシピ分類用のマスターデータ（和食・洋食など）。シードで投入し、クライアントからの直接 INSERT/UPDATE/DELETE は禁止。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | カテゴリ ID |
| name | text | NO | - | 表示名 |
| slug | text | NO | - | URL 用スラッグ（kebab-case） |
| created_at | timestamptz | NO | now() | 作成日時 |

## 主キー

- `id`

## 外部キー

- なし

## インデックス

- `slug` UNIQUE

## 制約

- `slug` は `^[a-z0-9]+(-[a-z0-9]+)*$` に一致

## RLS

### SELECT

- **authenticated users can select categories** — ログイン済みユーザー

### INSERT

- **no direct insert on categories** — 常に拒否（サービスロール・マイグレーションのみ）

### UPDATE

- **no direct update on categories** — 常に拒否

### DELETE

- **no direct delete on categories** — 常に拒否

## 設計上の補足

レシピとの多対多は `recipe_categories` で表現する。
