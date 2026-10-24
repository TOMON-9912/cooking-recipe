# サインアップ

## 仕様

未登録の人がメールとパスワードでアカウントを作り、確認メールの流れに入れる。

## スコープ

### 含める

- `signupAction` / `signupUsecase`
- `/signup` と確認案内 `/signup/verify-email`

### 含めない

- callback の詳細（[email-confirmation-callback.md](./email-confirmation-callback.md)）
- ゲスト

## 設計

```text
signup/page.tsx
  → signupAction
    → signupUsecase（メール形式、パスワード 8 文字以上）
      → signUp（emailRedirectTo は callback）
```

確認完了は callback 側。ここは「登録を受け付け、メールを送る」まで。

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [signup.md](../../ui/screens/signup.md) |
| callback | [email-confirmation-callback.md](./email-confirmation-callback.md) |
| テスト設計 | [signup.md](../../../03_test/design/auth/signup.md) |
