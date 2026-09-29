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

## テスト設計

| ケース | 層 | 期待 |
| --- | --- | --- |
| ログイン中に実行 | e2e / 手動 | 保護ルートが `/login` になる |

## 関連

| 種類 | リンク |
| --- | --- |
| ログイン | [login.md](./login.md) |
| 画面 | [top.md](../../06_ui/screens/top.md) |
