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

- `user_id` — 一意

## 制約

- 同一ユーザーが同一家族に重複参加不可（複合 PK）
- `user_id` 一意

## RLS

### SELECT

- **members can select family members** — `family_id ∈ get_my_family_ids()`

### INSERT

- ポリシーなし

### UPDATE

- ポリシーなし

### DELETE

- **users can leave families** — `user_id = auth.uid()`

## 設計上の補足

承認時の人数上限は、`approve_family_invite` が家族行をロックして拒否する（[join-family.md](../../application/family/join-family.md)）。
