# ドメイン概要

このアプリの中心は **レシピ** と **家族（共有単位）** です。ユーザーは Supabase Auth 上の **profiles** と紐づき、1 ユーザーが 1 家族に所属するモデルを前提にしています。

## ドキュメント

| トピック | 説明 |
| --- | --- |
| [設計書の書き方](./writing-guide.md) | 章立ての意図。新規は `docs/02_domain/_template.md` をコピーする |
| [recipe.md](./recipe.md) | レシピ（現行は概要のみ。テンプレートに合わせて拡充する） |
| [user.md](./user.md) | ユーザー（同上） |

永続化の詳細は [database/tables/](../03_database/tables/README.md)、画面仕様は [ui/screens/](../06_ui/screen-flow.md) を参照してください。
