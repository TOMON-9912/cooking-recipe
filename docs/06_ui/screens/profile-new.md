# プロフィール作成

## 何ができるか

表示名を決めて、自分のプロフィールを初めて残す。

## ルート

| パス | 認証 | Primary Action |
| --- | --- | --- |
| `/profile/new` | 必要 | プロフィールを保存 |

## 情報設計

- ファーストビュー: 表示名の入力と保存
- `/top` 到達時に未作成ならここへ強制 redirect

## 導線

| 入る | 出る |
| --- | --- |
| `/top` からの redirect | 成功 → `/top?toast=profileCreated` |

## 含まない

- プロフィール編集

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ | [create-profile.md](../../04_application/profile/create-profile.md) |
