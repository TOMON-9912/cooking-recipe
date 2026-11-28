---
name: write-table-definition
description: Creates or updates a table definition under docs/02_design/database/tables. Use when adding or editing a table definition, or when write-design changes one.
---

# テーブル定義を書く

`docs/02_design/database/tables/{name}.md` は、できたあとの形だけを書く。削除する、これまで、今回変えない、といった経緯は書かない。

新規は `docs/02_design/database/tables/_template.md` をコピーし、同ディレクトリの `README.md` の一覧に 1 行足す。章立ては README のフォーマット。

ポリシーが無い操作は「ポリシーなし」だけ。理由や、代わりにどの関数が書くかは、その行に書かない。

関数があるときは、テンプレートの章のあとに、名前・引数・戻り・内容だけを書く。
