---
name: write-test-design
description: Writes the test design (what to verify and how) for a slice whose requirements and design are confirmed. Use when filling test design, or running /test-design.
---

# テスト設計を書く

実装しない。仕様・設計は書かない（`/design`）。書くのは `docs/03_test/design/{関心事}/{操作}.md`（設計の `docs/02_design/application` と同じ構成）。テスト戦略自体の変更だけ `docs/03_test` 直下。

このスキルは、テスト設計 Issue を作り、そのブランチでテスト設計を書く（`docs/05_development/issue-workflow.md`）。次のプロセス（実装）の Issue は作らない。

## 始める前

1. 要件定義（`docs/01_requirements/{機能}.md`）と設計（`docs/02_design`）がある
2. 要件定義 Issue と設計 Issue が閉じている（PR がマージ済み）、またはユーザーがこのチャットで確定を明示している

どちらかが無いときは、書かずに止まり、`/requirements` または `/design` へ戻す。

## 始め方

`docs/05_development/issue-workflow.md` の「各プロセスの始め方」に従う。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 設計 Issue が閉じていることを確かめる（`gh issue view {番号} --json state`）。開いていれば止まって聞く
3. 親の子 Issue を確かめ（`gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues' --jq '.[] | "\(.number) \(.state) \(.title)"'`）、テスト設計 Issue が無ければ作る。タイトルは `docs(test): {機能}のテスト設計`、本文は骨格のとおり。前提に要件定義 Issue と設計 Issue、成果物にパスだけ書く（`gh issue create --parent {親} --title "…" --body-file {ファイル}`）
4. `git switch -c docs/{Issue}-test-design-{slug} origin/develop` で作業ブランチを切る。push しない

## 書き方

- 要件の ID（`FR-` / `NFR-`）と、要件定義の受け入れ条件を、検証の観点に結びつける
- 設計（失敗の意味、権限、状態）から、正常系・異常系・境界の観点を出す
- 受け入れ条件の全文コピー、完成したテストコードは書かない
- 要件・設計に無いことを足さない。足りないと気づいたら、書かずに戻り先（`/requirements` または `/design`）を示す
- ひな形は `docs/03_test/design/_template.md`、一覧は `docs/03_test/design/README.md`

## 完了

書いたパス、作った Issue とブランチ、まだ人間が決めることを列挙する。次は人間によるレビューと PR（依頼があるときだけ。PR 本文に `Closes #{テスト設計 Issue}`）。PR がマージされて Issue が閉じたら、実装 Issue を `/implement` が作る。実装へ進まない。Ready は付けない。
