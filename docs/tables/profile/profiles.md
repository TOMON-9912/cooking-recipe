# profiles

ユーザーの表示名とアイコンを保持するテーブル。`auth.users` の 1:1 拡張。

## カラム

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | ユーザー ID |
| `display_name` | `text` | NOT NULL, 1〜30 文字 | 表示名 |
| `avatar_icon` | `text` | NOT NULL, 許可リスト | 既定アイコン集のキー |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | 作成日時 |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | 更新日時 |

## 許可される `avatar_icon`

`chef-hat` / `utensils` / `heart` / `home` / `smile` / `user` / `coffee` / `leaf`

## RLS

| 操作 | ポリシー |
|---|---|
| SELECT | 本人、または `is_same_family(id)` |
| INSERT | 本人のみ（`id = auth.uid()`） |
| UPDATE | 本人のみ |
