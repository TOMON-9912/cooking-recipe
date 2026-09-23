# accessible_recipe_ids ビュー

## 概要

`recipes.id` のみを返すビュー。子テーブルの RLS で「閲覧可能なレシピか」を `EXISTS (SELECT 1 FROM accessible_recipe_ids …)` と書くための再利用用。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | - | レシピ ID（`recipes.id`） |

## 主キー

- なし（ビュー）

## 外部キー

- 論理的に `recipes.id`

## インデックス

- なし（基底テーブル `recipes` のインデックスを利用）

## 制約

- `security_invoker = true` — 呼び出しユーザーの権限で評価し、基底 `recipes` の RLS がそのまま効く

## RLS

ビュー自体に RLS はない。評価時に `recipes` の SELECT ポリシー（作者の全件 + 家族の公開レシピ）が適用される。

### SELECT

- 上記のとおり `recipes` RLS に従う

### INSERT / UPDATE / DELETE

- 不可（ビュー定義に DML なし）

## 設計上の補足

ポリシー名に `accessible` とある子テーブルはすべて本ビュー経由。詳細は [008-rls-helper-functions.md](../../09_decisions/008-rls-helper-functions.md)。
