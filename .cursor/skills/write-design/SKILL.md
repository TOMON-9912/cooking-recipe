---
name: write-design
description: Writes only Architecture, database, and ADR for a planned slice whose requirements are confirmed. Does not write domain, application, api, or ui. Tests are written later with /implement, not in this process. Use when filling design, or running /design.
---

# 設計を書く

実装しない。テストも書かない。テストは `/implement` がコードと一緒に書く。書くのは次だけ（[ADR 014](../../docs/04_decisions/014-narrow-design-and-test-artifacts.md)）。

| 書く | 書かない |
| --- | --- |
| `docs/02_design/architecture`（構造やデータの流れが変わるとき） | `docs/02_design/domain` |
| `docs/02_design/database` | `docs/02_design/application` |
| `docs/04_decisions` | `docs/02_design/api`、`docs/02_design/ui` |

すでに存在する domain / application / ui は消さない。このプロセスで足さない。

`docs/90_workspace/work/` への下書きは Ready に数えない。正本は `docs/01_requirements`〜`docs/04_decisions`。

このスキルは、設計 Issue を作り、そのブランチで設計を書く（`docs/05_development/issue-workflow.md`）。次のプロセス（テスト）の Issue は作らない。

点検は [authoring-checklist.md](authoring-checklist.md)。レビュー観点の正は `.cursor/skills/review-design/checklist.md`。

## 始める前

1. 対象の要件定義（`docs/01_requirements/{機能}.md`）がある
2. 要件定義が確定している: 要件定義 Issue が閉じている（PR がマージ済み）、またはユーザーがこのチャットで確定を明示している

どちらかが無いときは、設計を書かずに止まり、`/requirements` へ戻す。

## 始め方

`docs/05_development/issue-workflow.md` の「各プロセスの始め方」に従う。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 要件定義 Issue が閉じていることを確かめる（`gh issue view {番号} --json state`）。開いていれば止まって聞く
3. 親の子 Issue を確かめ、設計 Issue が無ければ作る。タイトルは `docs(design): {機能}の設計`。成果物は Architecture / database / ADR のパスだけ
4. `git switch -c docs/{Issue}-design-{slug} origin/develop` で作業ブランチを切る。push しない

## 要件との関係

- database と ADR は、要件の ID（`FR-` / `NFR-`）を参照する
- 要件に無いことを足さない。足したくなったら要件定義に戻し、人間が決める
- 不変条件は database で閉じる。制約、RLS（変えてよい列まで）、検証付きの `security definer` 関数のいずれか。usecase だけの説明で終えない
- `security definer` を出すなら、関数名、`GRANT EXECUTE` の相手、`search_path` を ADR 006 に合わせて書く
- 同時実行で破れる条件は、破りうる操作のすべてで同じ閉じ方を指す。決められないなら止まって聞く

## 完了

書いたパス、作った Issue とブランチ、まだ人間が決めることを列挙する。次は `/review-design`。PR は依頼があるときだけ（本文に `Closes #{設計 Issue}`）。この Skill では実装しない。設計 Issue が閉じて承認されたあとの次のフェーズは `/implement`（コードと、必要な Vitest・e2e）。Ready は付けない。
