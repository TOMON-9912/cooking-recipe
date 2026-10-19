# recipes テーブル

## 概要

レシピの基本情報（タイトル・説明・サムネイル参照・人数・調理時間・公開状態）を管理する。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | レシピ ID |
| title | text | NO | - | レシピ名 |
| description | text | YES | NULL | 説明 |
| thumbnail_url | text | YES | NULL | サムネイル（Supabase Storage パス） |
| serving_count | integer | NO | - | 何人前 |
| preparation_time_minutes | integer | NO | - | 調理時間（分） |
| is_draft | boolean | NO | true | 下書きなら true（作者のみ操作） |
| author_id | uuid | NO | - | 作成者（auth.users.id） |
| created_at | timestamptz | NO | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時（トリガーで自動更新） |

## 主キー

- `id`

## 外部キー

- `author_id` → `auth.users(id)` ON DELETE CASCADE

## インデックス

- `(author_id, is_draft)` — 自分のレシピ・下書き一覧

## 制約

- `serving_count > 0`
- `preparation_time_minutes > 0`

## RLS

### SELECT

- **authors can select own recipes** — `author_id = auth.uid()`
- **family members can select published recipes** — `is_draft = false` かつ作者と同じ家族（`family_members` の EXISTS）

### INSERT

- **authenticated users can insert recipes** — `author_id = auth.uid()`

### UPDATE

- **authors can update own recipes** — `author_id = auth.uid()`（家族メンバーによる更新は不可。`20260913000003`）

### DELETE

- **authors can delete own recipes** — `author_id = auth.uid()`（家族メンバーによる削除は不可。`20260913000003`）

## 設計上の補足

材料・手順・カテゴリは子テーブルで管理し、更新時は RPC `update_recipe_with_relations` で本体とまとめて置き換える。画像本体は Storage に保存し、本テーブルにはパスのみ保持する。
