---
name: write-design
description: Writes only the missing design docs (specification, design, test design) for a planned slice whose requirements are confirmed. Use when filling design or test design, or running /design.
---

# 設計を書く

実装しない。`/plan` が示した不足分だけを、`docs/02_design`・`docs/03_test`・`docs/04_decisions` に書く。判断が複数あるときは草案を出して止まる。

`docs/90_workspace/work/` への下書きは Ready に数えない。正本は `docs/01_requirements`〜`docs/04_decisions`。

## 始める前

1. 対象の要件定義（`docs/01_requirements/{機能}.md`）がある
2. 要件定義が確定している: Issue の「要件定義の確定」が付いている、またはユーザーがこのチャットで確定を明示している

どちらかが無いときは、設計を書かずに止まり、`/requirements` へ戻す。要件定義をここで書かない。

## 要件との関係

- 仕様・設計・テスト設計は、要件の ID（`FR-` / `NFR-`）を参照する
- 要件に無いことを足さない。足したくなったら要件定義に戻し、人間が決める
- 要件の「設計への申し送り」と「未決・リスク」を読み、未決を勝手に決めない

## 混ぜない

| 種類 | 書く | 書かない |
| --- | --- | --- |
| Specification | 要件を満たすためのルール・状態・権限・失敗の意味 | 要求・なぜ作るか（要件定義へ）、テーブル、手順 |
| Design | 内部でどう実現するか | 「ユーザーができること」だけの再掲 |
| Test Design | 何をどう検証するか | AC の全文コピー、完成コード |

Issue に設計本文を複製しない。パスを Design links に足すのは人間の依頼時だけ。

## 置き場

- Specification → 主に `docs/02_design/domain`
- Design → 変更する層だけ（`docs/02_design/architecture` / `database` / `application` / `api` / `ui`）。判断理由は `docs/04_decisions`
- Test Design → `docs/03_test/design/{関心事}/{操作}.md`（設計の `application` と同じ構成）。テスト戦略自体の変更だけ `docs/03_test` 直下
- 画面の経路・成功遷移は、実装の page / フォームを見て書く。未確認なら「未記載」とする

ひな形は各ディレクトリの `_template.md`。

## 完了

書いたパスと、まだ人間が決めることを列挙する。実装へ進まない。Ready は付けない。
