# family_invites テーブル

## 概要

家族オーナーが発行する、宛先指定の招待。1 件 = 1 人宛て。秘密のトークンは持たない。方針は [ADR 011](../../../04_decisions/011-family-invite-link.md)。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() | 招待 ID |
| family_id | uuid | NO | - | 参加先の家族 |
| invited_email | text | NO | - | 宛先。保存時に小文字へ揃える |
| created_by | uuid | NO | - | 発行したオーナー（auth.users.id） |
| expires_at | timestamptz | NO | - | 有効期限（発行から 1 日） |
| used_by | uuid | YES | - | 承認した人。未使用なら NULL |
| used_at | timestamptz | YES | - | 承認した日時。未使用なら NULL |
| revoked_at | timestamptz | YES | - | 取り消した日時。未取り消しなら NULL |
| created_at | timestamptz | NO | now() | 発行日時 |

## 主キー

- `id`

## 外部キー

- `family_id` → `families(id)` ON DELETE CASCADE
- `created_by` → `auth.users(id)` ON DELETE CASCADE
- `used_by` → `auth.users(id)` ON DELETE SET NULL

## インデックス

- `(family_id, invited_email)` — 重ね発行の照会
- `family_id` — オーナーの一覧

## 制約

- `used_by` と `used_at` は両方 NULL か、両方 NOT NULL
- 使用済み（`used_at` が NOT NULL）と取り消し済み（`revoked_at` が NOT NULL）は同時に立てない
- 宛先の期限内未使用の一意は、部分 UNIQUE に `now()` を書けないため制約にしない。発行用 DB 関数 `create_family_invite` が家族行をロックしてから拒否する。クライアントの直 INSERT はポリシー無しで通さない（FR-15）

## RLS

### SELECT

- **owner can select own family invites** — `family_id` の家族の `owner_id = auth.uid()`。オーナー一覧（宛先と期限）用
- 宛先本人は、このテーブルを直接 SELECT しない。家族名の照会は `list_my_family_invites()`（[list-my-family-invites.md](../../application/family/list-my-family-invites.md)）

### INSERT

- ポリシーなし。発行は `create_family_invite` だけが行う。直 INSERT では重ね発行を防げないため

### UPDATE

- ポリシーなし。取り消しは `cancel_family_invite`（`revoked_at` のみ）、使用済み化は `approve_family_invite` だけが行う。直 UPDATE では宛先や `used_*` を書き換えられないようにする

### DELETE

- ポリシーなし

## DB 関数

いずれも `security definer`、`set search_path = public, pg_temp`（[ADR 006](../../../04_decisions/006-rls-helper-functions.md)）。`GRANT EXECUTE` は `authenticated` のみ。`public` と `anon` には付けない（既定の PUBLIC 権限は外す）。

| 関数 | 引数 | 戻り | 検証の要点 |
| --- | --- | --- | --- |
| `create_family_invite` | `p_family_id uuid`, `p_invited_email text` | 招待 ID | オーナー、`is_permanent_user()`、宛先を小文字化、家族行 `FOR UPDATE` のあと期限内未使用の同一宛先が無いこと。宛先が `auth.users` に在るかは見ない |
| `cancel_family_invite` | `p_invite_id uuid` | なし | オーナー、`is_permanent_user()`、未使用・未取り消し。`revoked_at` だけを立てる |
| `approve_family_invite` | `p_invite_id uuid` | なし | ログイン、`is_permanent_user()`、`auth.users.email_confirmed_at`、未所属、招待が有効、`lower(invited_email) = lower(auth.users.email)`（`id = auth.uid()`）。所属追加と使用済み化を 1 トランザクション。JWT の email クレームだけに頼らない |
| `list_my_family_invites` | なし（`auth.uid()`） | 招待 ID、家族名、期限 | `lower(invited_email) = lower(auth.users.email)` かつ未使用・未取り消し・期限内。所属の有無は問わない。家族 ID・メンバー・オーナー名・他人の宛先は返さない |
| `is_permanent_user` | なし | boolean | ADR 007 の JWT `is_anonymous`。発行・承認・取り消しの関門 |
| `family_member_limit` | なし | integer（6） | 人数上限の正。課金で変えるときはこの戻り値だけ（NFR-07） |

メール比較の正は `auth.users.email`（確認済みの登録メール）。`auth.jwt()` の email クレームは正にしない。

## 設計上の補足

- 期限切れ・使用済み・取り消し済みの行は残す。一覧 UI には出さない。削除バッチは作らない
- 直接変更と関数経由の正: SELECT はオーナーの RLS。INSERT / UPDATE は上表の関数だけ