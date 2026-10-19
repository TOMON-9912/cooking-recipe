# ADR 014: 設計とテストの成果物を絞る

## 背景

[ADR 012](./012-requirements-before-design.md) は、設計を domain / database / application / api / ui に分け、テストは操作ごとのテスト設計文書にした。[ADR 013](./013-issue-per-process.md) は、そのテスト設計を独立したプロセスにした。

家族メンバー追加の設計で、文書の量に対して、実装と検証に使う判断が database と ADR に集まっていた。操作メモ、画面、テスト観点表を増やすほど、レビューの対象が実装の前に膨らむ。

## 決定内容

**新しく書く設計は、Architecture、database、ADR だけにする。テストフェーズの成果物は、次の 3 種類のテストコードだけにする。**

設計フェーズで書くもの:

| 書く | 書かない |
| --- | --- |
| `docs/02_design/architecture`（構造やデータの流れが変わるとき） | `docs/02_design/domain` |
| `docs/02_design/database` | `docs/02_design/application` |
| `docs/04_decisions` | `docs/02_design/api`、`docs/02_design/ui` |

テストフェーズで書くもの:

| 種類 | 見ること |
| --- | --- |
| Vitest（モックあり） | usecase / action。deps はモック |
| Vitest（実 DB） | RLS、RPC、書き込み後の読み戻し、同時実行。ローカルの DB |
| e2e | 画面をまたぐクリティカルパス（Playwright） |

- 操作ごとのテスト設計 Markdown（`docs/03_test/design`）と、汎用の観点表は、フェーズの必須成果物にしない
- すでにマージ済みの domain / application / ui / テスト設計は消さない。次のスライスから足さない
- 不変条件は database（制約、RLS、検証付き関数）と ADR で閉じる。usecase だけの説明で終えない
- 各フェーズのレビュー報告のあと、そのフェーズの Skill を見直す。手順が足りない、または手順が成果物を増やしている箇所だけを直す。指摘を設計書やコードへ反映するかは、レビューでは聞かない

## なぜこの案か

| 案 | 採否 | 理由 |
| --- | --- | --- |
| 設計を Architecture / database / ADR に絞り、テストは 3 種のコードにする | 採用 | 判断の正本が DB と ADR に残り、検証は実行できるテストになる |
| いまの層ごとの設計と、操作ごとのテスト設計文書を続ける | 不採用 | レビュー対象が実装の前に増え、同じルールを複数の文書に書く |
| 既存の domain / application / ui を削除する | 不採用 | マージ済みの家族メンバー追加の設計を、さかのぼって消す必要はない |

## 結果・利点

- 設計レビューは、構造、テーブルと権限、判断理由に限られる
- テストのレビューは、通るコード（モック、実 DB、e2e）を見る
- フェーズのたびに Skill の手順を、そのレビューで分かった範囲だけ直せる

## 考慮点・トレードオフ

- 画面の主目的や失敗時の文言は、設計文書には残らない。e2e と実装で確かめる
- 実 DB の Vitest は、ローカルの DB が要る。モックの Vitest では RLS を検証したことにしない
- 実装がまだ無い操作のテストは、テストフェーズの時点では失敗してよい。実装フェーズで通す
- 家族メンバー追加（Issue #37）の設計は、この決定の前に domain / application / ui まで書いてマージ済みである。消さず、実装の参照に使ってよい。追加の設計文書は書かない

## 関連

- [ADR 012: 要件定義を設計の前に置く](./012-requirements-before-design.md)
- [ADR 013: プロセスごとの Issue](./013-issue-per-process.md)
- [issue-workflow.md](../05_development/issue-workflow.md)
