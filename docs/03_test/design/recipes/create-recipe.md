# レシピ作成（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 料理名が空 | usecase | 拒否 |
| 人数・時間が不正 | usecase | 拒否 |
| 正常作成 | usecase / action | レシピと関連が残る |
| 未ログイン | e2e / proxy | `/login` へ |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [create-recipe.md](../../../02_design/application/recipes/create-recipe.md) |
