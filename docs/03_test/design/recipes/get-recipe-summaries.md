# レシピ一覧取得（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 印があるレシピ | usecase | `isFavorited` が true |
| 印がないレシピ | usecase | false |
| 見えないレシピ | infrastructure / RLS | 一覧に出ない |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [get-recipe-summaries.md](../../../02_design/application/recipes/get-recipe-summaries.md) |
