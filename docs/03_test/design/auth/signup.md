# サインアップ（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 短いパスワード | usecase | 拒否 |
| 不正メール | usecase | 拒否 |
| 正常 | action | verify-email へ |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [signup.md](../../../02_design/application/auth/signup.md) |
