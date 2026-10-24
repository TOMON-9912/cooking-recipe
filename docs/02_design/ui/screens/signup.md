# サインアップ

## 何ができるか

メールとパスワードでアカウントを作り、確認メールの案内を見る。

## ルート

| パス | 認証 | Primary Action |
| --- | --- | --- |
| `/signup` | 不要 | 登録する |
| `/signup/verify-email` | 不要 | 案内を読む（次の行動はメール） |

## 情報設計

- ファーストビュー: 登録フォーム
- 失敗時: 形式・パスワード長のエラー
- verify-email: メールを確認する説明とログインへの戻り

## 導線

| 入る | 出る |
| --- | --- |
| LP | 登録後 → verify-email。確認リンク → `/auth/callback` |

## 含まない

- callback の実装詳細

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ | [signup.md](../../application/auth/signup.md)、[email-confirmation-callback.md](../../application/auth/email-confirmation-callback.md) |
