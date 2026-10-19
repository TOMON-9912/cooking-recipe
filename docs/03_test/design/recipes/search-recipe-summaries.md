# レシピ検索（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| `50%` のような語 | infrastructure | ワイルドカードとして広がらない |
| カテゴリのみ | usecase | そのカテゴリに絞る |
| ヒットなし | page | 空状態と次の行動 |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [search-recipe-summaries.md](../../../02_design/application/recipes/search-recipe-summaries.md) |
