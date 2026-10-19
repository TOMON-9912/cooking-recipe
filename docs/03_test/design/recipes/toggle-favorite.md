# お気に入り切替（テスト設計）

完了条件（Issue の AC）のコピーにしない。どの層で何を検証するかを書く。

| ケース | 層 | 期待 |
| --- | --- | --- |
| 未登録 | usecase | 登録され `isFavorited: true` |
| 登録済み | usecase | 外れ `false` |
| 未認証 | action / RLS | 拒否 |

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ（設計） | [toggle-favorite.md](../../../02_design/application/recipes/toggle-favorite.md) |
