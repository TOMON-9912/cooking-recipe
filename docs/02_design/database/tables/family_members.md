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
- **`user_id` の一意制約は付けない。** 1 ユーザー 1 家族は `approve_family_invite` 内の直列化で保証する（ADR 005 の複数家族を残す。ADR 011）

## RLS

### SELECT

- **members can select family members** — `family_id ∈ get_my_family_ids()`

### INSERT

- **owner can add self as first member** — `user_id = auth.uid()` かつ、その `family_id` の `families.owner_id = auth.uid()`。家族作成時のオーナー本人追加だけ
- 招待による承認はクライアントの INSERT では通さない。`approve_family_invite` だけが行う

### UPDATE

- ポリシーなし

### DELETE

- **users can leave families** — `user_id = auth.uid()`

## 設計上の補足

家族作成フローでは families INSERT 後にオーナーを family_members に追加する。変更後の INSERT ポリシーを満たす。
承認時の二重所属と人数上限は、`approve_family_invite` が家族行とユーザー単位で直列化して拒否する（[join-family.md](../../application/family/join-family.md)）。
