# テストスコープ

## 層ごとの重点

| 層 | 方針 |
| --- | --- |
| usecase | ビジネスルール・バリデーション・認可の中心。最優先で単体テスト |
| app (Action) | フォーム変換・エラー文言・revalidate。deps モック |
| infrastructure | クエリ組み立て・RPC 引数。Supabase モック |
| presentation | 分岐の多い純関数（例: サムネイルパス）のみ |

## E2E

クリティカルパス（未ログインリダイレクト、編集導線など）を `e2e/` でカバー。RLS や Cookie の挙動は E2E だけでは不足するため、usecase + ローカル Supabase も併用します。

## インシデントメモ

[incidents/family-create-rls-select.md](./incidents/family-create-rls-select.md)
