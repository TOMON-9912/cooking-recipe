# テスト設計

何をどう検証するかを、操作ごとに書く。設計（`docs/02_design/application`）と同じ関心事ディレクトリ・同じファイル名に揃える。新規は [_template.md](./_template.md) をコピーする。

テスト戦略（方針・範囲）は [strategy.md](../strategy.md) と [test-scope.md](../test-scope.md)。ここには、操作ごとのケースだけを置く。

## 書かないこと

- 受け入れ条件（要件定義・Issue の完了条件）のコピー
- 完成したテストコード

## 一覧

| 関心事 | 操作 | ファイル |
| --- | --- | --- |
| auth | ログイン | [auth/login.md](./auth/login.md) |
| auth | サインアップ | [auth/signup.md](./auth/signup.md) |
| auth | ログアウト | [auth/logout.md](./auth/logout.md) |
| recipes | レシピ作成 | [recipes/create-recipe.md](./recipes/create-recipe.md) |
| recipes | 詳細取得 | [recipes/get-recipe-detail.md](./recipes/get-recipe-detail.md) |
| recipes | 一覧取得 | [recipes/get-recipe-summaries.md](./recipes/get-recipe-summaries.md) |
| recipes | 検索 | [recipes/search-recipe-summaries.md](./recipes/search-recipe-summaries.md) |
| recipes | お気に入り切替 | [recipes/toggle-favorite.md](./recipes/toggle-favorite.md) |
| recipes | サムネイルアップロード | [recipes/upload-recipe-thumbnail.md](./recipes/upload-recipe-thumbnail.md) |

既存のうち、テスト設計がまだ無い操作（レシピ更新、家族作成、ゲストなど）は、改定するときに追加する。
