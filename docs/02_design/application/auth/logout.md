# ログアウト

## 仕様

ログイン中のユーザーがセッションを終わり、未ログインの入口に戻れる。

## スコープ

### 含める

- `logoutAction`（`src/app/top/logout-action.ts`）
- ヘッダーからの実行

### 含めない

- ゲストデータの即時削除（定期バッチ）

## 設計

```text
HeaderActions
  → logoutAction
    → supabase.auth.signOut()
```

usecase は置いていない。セッション破棄だけなので app に閉じている。

## 関連

| 種類 | リンク |
| --- | --- |
| ログイン | [login.md](./login.md) |
| 画面 | [top.md](../../ui/screens/top.md) |
| テスト設計 | [logout.md](../../../03_test/design/auth/logout.md) |
