# ユーザー・認証ドメイン

## 概念

- **通常ユーザー**: メールサインアップ / ログイン、`profiles` 作成
- **ゲスト**: Supabase Anonymous Sign-In。定期バッチで削除（[application/guest/guest-cleanup-batch.md](../application/guest/guest-cleanup-batch.md)）
- **家族**: `families` / `family_members`。レシピの共有範囲に利用

## 関連

- DB: [profiles テーブル](../database/tables/profiles.md)
- 画面: [ui/screens/guest-login.md](../ui/screens/guest-login.md)
- ADR: [007 ゲストログイン](../../04_decisions/007-guest-login.md)
