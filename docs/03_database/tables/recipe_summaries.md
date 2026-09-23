# recipe_summaries ビュー

## 概要

レシピ一覧向けの集約ビュー。`recipes` の主要カラムと、紐づくカテゴリを JSON 配列 `categories` として返す（N+1 回避）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | - | レシピ ID |
| title | text | NO | - | レシピ名 |
| description | text | YES | - | 説明 |
| thumbnail_url | text | YES | - | サムネイルパス |
| serving_count | integer | NO | - | 何人前 |
| preparation_time_minutes | integer | NO | - | 調理時間（分） |
| is_draft | boolean | NO | - | 下書きフラグ |
| author_id | uuid | NO | - | 作者 ID |
| created_at | timestamptz | NO | - | 作成日時 |
| updated_at | timestamptz | NO | - | 更新日時 |
| categories | json | NO | - | `[{ id, name, slug }, …]`（未設定時 `[]`） |

## 主キー

- 論理的に `id`（`recipes.id` で GROUP BY）

## 外部キー

- なし（ビュー）

## インデックス

- なし

## 制約

- `security_invoker = true` — `recipes` / 関連テーブルの RLS が適用される

## RLS

### SELECT

- 基底 `recipes` および JOIN 先の RLS に従い、閲覧可能なレシピのみ行が返る

### INSERT / UPDATE / DELETE

- 不可

## 設計上の補足

カテゴリは `recipe_categories` → `categories` を LEFT JOIN し、`json_agg` で集約。アプリの一覧 API は本ビューを優先利用する。
