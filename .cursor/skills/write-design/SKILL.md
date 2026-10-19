---
name: write-design
description: Writes only the missing design docs (specification and design) for a planned slice whose requirements are confirmed. Test design is a separate process (/test-design). Use when filling design, or running /design.
---

# 設計を書く

実装しない。テスト設計は書かない（`/test-design`）。`/plan` が示した不足分だけを、`docs/02_design`・`docs/04_decisions` に書く。判断が複数あるときは草案を出して止まる。

`docs/90_workspace/work/` への下書きは Ready に数えない。正本は `docs/01_requirements`〜`docs/04_decisions`。

このスキルは、設計 Issue を作り、そのブランチで設計を書く（`docs/05_development/issue-workflow.md`）。次のプロセス（テスト設計）の Issue は作らない。

## 始める前

1. 対象の要件定義（`docs/01_requirements/{機能}.md`）がある
2. 要件定義が確定している: 要件定義 Issue が閉じている（PR がマージ済み）、またはユーザーがこのチャットで確定を明示している

どちらかが無いときは、設計を書かずに止まり、`/requirements` へ戻す。要件定義をここで書かない。

## 始め方

`docs/05_development/issue-workflow.md` の「各プロセスの始め方」に従う。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 要件定義 Issue が閉じていることを確かめる（`gh issue view {番号} --json state`）。開いていれば止まって聞く
3. 親の子 Issue を確かめ（`gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues' --jq '.[] | "\(.number) \(.state) \(.title)"'`）、設計 Issue が無ければ作る。タイトルは `docs(design): {機能}の設計`、本文は骨格のとおり。前提に要件定義 Issue、成果物に書く場所の見込み（パスだけ）、目的に要件の「設計への申し送り」の要約を書く（`gh issue create --parent {親} --title "…" --body-file {ファイル}`）
4. `git switch -c docs/{Issue}-design-{slug} origin/develop` で作業ブランチを切る。push しない

## 要件との関係

- 仕様・設計は、要件の ID（`FR-` / `NFR-`）を参照する
- 要件に無いことを足さない。足したくなったら要件定義に戻し、人間が決める
- 要件の「設計への申し送り」と「未決・リスク」を読み、未決を勝手に決めない

## 混ぜない

| 種類 | 書く | 書かない |
| --- | --- | --- |
| Specification | 要件を満たすためのルール・状態・権限・失敗の意味 | 要求・なぜ作るか（要件定義へ）、テーブル、手順 |
| Design | 内部でどう実現するか | 「ユーザーができること」だけの再掲 |

テスト設計（何をどう検証するか）は、この PR に入れない。`/test-design` で別に書く。

Issue に設計本文を複製しない。パスを Design links に足すのは人間の依頼時だけ。

## 置き場

- Specification → 主に `docs/02_design/domain`
- Design → 変更する層だけ（`docs/02_design/architecture` / `database` / `application` / `api` / `ui`）。判断理由は `docs/04_decisions`
- 画面の経路・成功遷移は、実装の page / フォームを見て書く。未確認なら「未記載」とする

ひな形は各ディレクトリの `_template.md`。

## 完了

書いたパス、作った Issue とブランチ、まだ人間が決めることを列挙する。次は人間による設計のレビューと PR（依頼があるときだけ。PR 本文に `Closes #{設計 Issue}`）。PR がマージされて Issue が閉じたら `/test-design`。実装へ進まない。Ready は付けない。
