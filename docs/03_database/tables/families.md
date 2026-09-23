# families テーブル

## 概要

家族グループ。レシピ共有の単位（同一家族の公開レシピを相互閲覧）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 家族 ID |
| name | text | NO | - | 家族名 |
| owner_id | uuid | NO | - | オーナー（auth.users.id） |
| created_at | timestamptz | NO | now() | 作成日時 |

## 主キー

- `id`

## 外部キー

- `owner_id` → `auth.users(id)` ON DELETE CASCADE（`20260726000001`）

## インデックス

- `owner_id`

## 制約

- なし（名称の長さ等はアプリ側バリデーション）

## RLS

### SELECT

- **members can select own families** — `id ∈ get_my_family_ids()` または `owner_id = auth.uid()`（作成直後メンバー未登録時の閲覧用、`20260622000001`）

### INSERT

- **authenticated users can insert families** — ログイン済み（オーナー設定はアプリ側）

### UPDATE

- **owner can update family** — `owner_id = auth.uid()`

### DELETE

- ポリシーなし（オーナー削除時 CASCADE 等は Auth / バッチ側）

## 設計上の補足

メンバー所属は `family_members`。RLS ヘルパー `get_my_family_ids()` / `is_same_family()` は [008-rls-helper-functions.md](../../09_decisions/008-rls-helper-functions.md) を参照。
