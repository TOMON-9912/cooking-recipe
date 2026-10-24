# ユースケース一覧

Server Action から usecase を呼び出す処理の実装メモです。deps パターンで infrastructure を app 層から注入します。

新規の操作メモは [_template.md](./_template.md) をコピーする。

## レシピ

| ドキュメント | 操作 |
| --- | --- |
| [recipes/create-recipe.md](./recipes/create-recipe.md) | レシピ作成 |
| [recipes/update-recipe.md](./recipes/update-recipe.md) | レシピ更新（作者のみ） |
| [recipes/get-recipe-detail.md](./recipes/get-recipe-detail.md) | 詳細取得 |
| [recipes/get-recipe-summaries.md](./recipes/get-recipe-summaries.md) | 一覧取得 |
| [recipes/search-recipe-summaries.md](./recipes/search-recipe-summaries.md) | 検索 |
| [recipes/toggle-favorite.md](./recipes/toggle-favorite.md) | お気に入り切替 |
| [recipes/upload-recipe-thumbnail.md](./recipes/upload-recipe-thumbnail.md) | サムネイルアップロード |

## 認証・ユーザー

| ドキュメント | 操作 |
| --- | --- |
| [auth/login.md](./auth/login.md) | メールログイン |
| [auth/signup.md](./auth/signup.md) | サインアップ |
| [auth/logout.md](./auth/logout.md) | ログアウト |
| [auth/email-confirmation-callback.md](./auth/email-confirmation-callback.md) | 確認メール callback |
| [guest/guest-login.md](./guest/guest-login.md) | ゲストログイン |
| [guest/guest-cleanup-batch.md](./guest/guest-cleanup-batch.md) | ゲスト削除バッチ |
| [profile/create-profile.md](./profile/create-profile.md) | プロフィール作成 |

## 家族

| ドキュメント | 操作 |
| --- | --- |
| [family/create-family.md](./family/create-family.md) | 家族作成 |
| [family/get-family-overview.md](./family/get-family-overview.md) | 家族概要取得 |
| [family/create-family-invite.md](./family/create-family-invite.md) | 招待発行 |
| [family/list-family-invites.md](./family/list-family-invites.md) | 招待一覧（オーナー） |
| [family/list-my-family-invites.md](./family/list-my-family-invites.md) | 自分宛ての招待照会 |
| [family/cancel-family-invite.md](./family/cancel-family-invite.md) | 招待取り消し |
| [family/join-family.md](./family/join-family.md) | 招待の承認 |

## ソース対応表

機能とファイルの対応は [source-index/README.md](./source-index/README.md) を参照してください。
