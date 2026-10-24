# レシピサムネイルアップロード（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 空ファイル | usecase | 拒否 |
| 上限超過 | usecase | 拒否 |
| 許可外タイプ | usecase | 拒否 |
| 正常 | usecase | path が返る |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [upload-recipe-thumbnail.md](../../../02_design/application/recipes/upload-recipe-thumbnail.md) |
