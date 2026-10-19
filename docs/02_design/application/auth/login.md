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

成功後は現状 `/top` 固定。`redirectTo` は未使用（[screen-flow.md](../../ui/screen-flow.md) の改善候補）。

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [login.md](../../ui/screens/login.md) |
| ドメイン | [user.md](../../domain/user.md) |
| テスト設計 | [login.md](../../../03_test/design/auth/login.md) |
