# メールログイン

## 仕様

本登録ユーザーが、メールとパスワードでセッションを開始できる。

## スコープ

### 含める

- `loginAction` / `loginUsecase`
- `/login` のメールログイン

### 含めない

- ゲスト（[guest-login.md](../guest/guest-login.md)）
- サインアップ
- ログアウト（[logout.md](./logout.md)）

## 設計

```text
login/page.tsx
  → loginAction
    → loginUsecase（メール形式・パスワード非空）
      → AuthRepository.login
```

成功後は現状 `/top` 固定。`redirectTo` は未使用（[screen-flow.md](../../06_ui/screen-flow.md) の改善候補）。

## テスト設計

| ケース | 層 | 期待 |
| --- | --- | --- |
| 不正なメール | usecase | 形式エラー |
| 空パスワード | usecase | 必須エラー |
| 正しい資格情報 | usecase / action | セッション確立、`/top` |

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [login.md](../../06_ui/screens/login.md) |
| ドメイン | [user.md](../../02_domain/user.md) |
