# ユーザー・認証ドメイン

## 概念

- **通常ユーザー**: メールサインアップ / ログイン、`profiles` 作成
- **ゲスト**: Supabase Anonymous Sign-In。定期バッチで削除（[application/guest/guest-cleanup-batch.md](../04_application/guest/guest-cleanup-batch.md)）
- **家族**: `families` / `family_members`。レシピの共有範囲に利用

## 関連

- DB: [database/tables/users.md](../03_database/tables/users.md)（profiles）
- 画面: [ui/screens/guest-login.md](../06_ui/screens/guest-login.md)
- ADR: [decisions/001-authentication.md](../09_decisions/001-authentication.md)
