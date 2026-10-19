# family_members テーブル

## 概要

ユーザーと家族の所属関係（多対多の中間テーブル）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| family_id | uuid | NO | - | 家族 ID |
| user_id | uuid | NO | - | ユーザー ID（auth.users.id） |
| joined_at | timestamptz | NO | now() | 参加日時 |

## 主キー

- `(family_id, user_id)`

## 外部キー

- `family_id` → `families(id)` ON DELETE CASCADE
- `user_id` → `auth.users(id)` ON DELETE CASCADE

## インデックス

- `user_id` — ユーザー所属家族の取得

## 制約

- 同一ユーザーが同一家族に重複参加不可（複合 PK）

## RLS

### SELECT

- **members can select family members** — `family_id ∈ get_my_family_ids()`

### INSERT

- **users can join families** — `user_id = auth.uid()`

### UPDATE

- ポリシーなし

### DELETE

- **users can leave families** — `user_id = auth.uid()`

## 設計上の補足

家族作成フローでは families INSERT 後にオーナーを family_members に追加する。
