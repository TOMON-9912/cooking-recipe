# レシピ作成

## 何ができるか

新しいレシピの内容を入力して保存する。

## ルート

| パス | 認証 | Primary Action |
| --- | --- | --- |
| `/recipe/new` | 必要 | 保存する（公開または下書き） |

## 情報設計

- ファーストビュー: 料理名と保存
- `RecipeForm` を作成モードで使う（編集と共用）

## 導線

| 入る | 出る |
| --- | --- |
| ヘッダー、トップの CTA、空状態 | 成功後は `/recipe/{id}`（`RecipeForm` が `router.push`。Action は redirect しない） |

## 含まない

- 編集画面の文言切り替え

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ | [create-recipe.md](../../application/recipes/create-recipe.md) |
