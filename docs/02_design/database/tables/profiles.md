# profiles テーブル

## 概要

`public.profiles` は、Supabase Auth の **`auth.users`** に 1:1 で紐づく表示用プロフィール。`public` に **`users` テーブルは存在しない**（ドメイン上の「ユーザー」は Auth + 本テーブルの組み合わせ）。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | NO | - | 主キー（= auth.users.id） |
| display_name | text | NO | - | 表示名（1〜30 文字） |
| avatar_icon | text | NO | - | アイコン識別子（許可リスト） |
| created_at | timestamptz | NO | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

## 主キー

- `id`

## 外部キー

- `id` → `auth.users(id)` ON DELETE CASCADE

## インデックス

- なし（PK のみ）

## 制約

- `char_length(trim(display_name)) between 1 and 30`
- `avatar_icon` は `chef-hat`, `utensils`, `heart`, `home`, `smile`, `user`, `coffee`, `leaf` のいずれか

## RLS

### SELECT

- **users can select own or same family profiles** — 自分、または `is_same_family(id)` が true のユーザー

### INSERT

- **users can insert own profile** — `id = auth.uid()`

### UPDATE

- **users can update own profile** — `id = auth.uid()`

### DELETE

- ポリシーなし（Auth ユーザー削除に CASCADE）

## 設計上の補足

メールアドレス・パスワード・ゲスト判定などは **`auth.users`**（アプリからは Auth API）。家族内で見せる名前・アイコンだけを **`profiles`** に保持する。
