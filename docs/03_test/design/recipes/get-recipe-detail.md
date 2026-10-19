# レシピ詳細取得（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 存在する閲覧可能な ID | usecase | 1 件返る |
| 無い / 見えない ID | page | 404 |
| 作者 | page | 編集へ進める |
| 作者以外 | page | 編集ボタンなし |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [get-recipe-detail.md](../../../02_design/application/recipes/get-recipe-detail.md) |
