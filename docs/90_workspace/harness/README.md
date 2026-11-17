# AI 開発ハーネス

チャットで指示し、Issue から設計を経て実装し、学びを **人間の採否を経て** 次回へ残す作業領域。プロダクト仕様の正本ではない。正本は `docs/01_requirements`〜`docs/04_decisions`。

判断の理由は [ADR 009](../../04_decisions/009-ai-dev-harness.md)、[ADR 010](../../04_decisions/010-issue-centered-dev-flow.md)、[ADR 012](../../04_decisions/012-requirements-before-design.md)、[ADR 013](../../04_decisions/013-issue-per-process.md)、[ADR 015](../../04_decisions/015-drop-implementation-start-checklist.md)。Issue と docs の分担は [issue-workflow.md](../../05_development/issue-workflow.md)。

## 目的

- Issue を「何を作るか」の入口にする
- 必要な設計が無いときは実装しない
- 指摘とレビューを、ハーネスまたは学習ログへ候補として返し、採用は人間が決める

## 開発フロー

```
親 Issue（What / Why / Scope / AC。/plan が下書きを作る）
  → /plan（変更種別の確定、必要な正本と理由、不足なら停止）
  各プロセス: 子 Issue → ブランチ → 作業 → PR → マージ → Issue を閉じる（前のプロセスのマージ後に始める）
  → /requirements（要件定義。何を・なぜ作るか。設計の前）
  → /design（不足している仕様・設計だけ。混ぜない）
  → /test-design（操作ごとのテスト設計）
  → 設計 Issue、または設計を作らないときの要件定義 Issue が閉じている
  → /implement または /coding または /pairpro
  → 検証 → /review → PR（明示依頼時）
  → /retrospect
```

全工程は強制しない。`/plan` が「なぜその設計が要るか」を書き、不要な層は要求しない。`work/` の下書きは、閉じた Issue の代わりにしない。

## 実装を始める条件

| 置き場 | 役割 |
| --- | --- |
| 設計 Issue | あるときは、閉じていることが実装の開始条件 |
| 要件定義 Issue | 設計を作らないと決まっていて設計 Issue が無いとき、閉じていることが実装の開始条件 |
| 実装 Issue | 操作の目的、範囲、完了条件、実装計画。開始のチェックリストは置かない |
| Project | 一覧。正本にしない |

AI は Issue を閉じない。完了のチェックも付けない。閉じたことにしない。

## 全体構造

| 場所 | 役割 |
| --- | --- |
| GitHub Issue | 開発対象（親）と、プロセスごとの子 Issue |
| `.cursor/rules/` | 常時の不変条件 |
| `.cursor/skills/` | 工程の手順 |
| `.cursor/commands/` | 工程の入口 |
| `docs/01_requirements`〜`04_decisions` | Requirements / Specification / Design / Test Design / Decision |
| このディレクトリ | ハーネス運用と改善候補 |
| `../learning/` | Learning Gap（人間の練習） |

## 責務

| 種類 | 書くこと | 書かないこと |
| --- | --- | --- |
| Rule | 破ったら不正な制約 | 手順、仕様、長い例 |
| Skill | その作業の手順と参照先 | 仕様の本文、常時制約の再掲 |
| Command | どの Skill で動くか | 判断ロジックの複製 |
| Documentation | このアプリで何が正しいか | AI の操作手順 |
| Candidate | 1 件のハーネス学び | 採否の自己決定、Learning Gap |

詳細は [placement-criteria.md](./placement-criteria.md)。

## 改善候補

1 件 1 ファイル: `candidates/YYYYMMDD-short-description.md`  
ひな形: [candidate-template.md](./candidate-template.md)

- **Source:** `human-review` / `ai-review` / `ai-gap`
- **Target:** `Rule` / `Skill` / `Documentation` / `Judgment`
- AI は作成まで。採否は人間。基準は [adoption-criteria.md](./adoption-criteria.md)

回数だけで Rule 化しない。GitHub Issue にはしない。

## AI と人間

| | AI | 人間 |
| --- | --- | --- |
| 実装の開始 | 前の Issue が開いていれば止まり、不足を指摘する | 要件定義か設計の Issue を閉じる |
| 実装・レビュー | 選ばれたモードで行う | モードと結果を決める |
| ハーネスファイル | 明示依頼がなければ変更しない | 変更を依頼する |
| 候補 / Learning | 作成する | 採否・Challenge を決める |

## 肥大化を防ぐ

- 新しい alwaysApply Rule を安易に足さない
- 仕様を Rule や Issue にコピーしない
- 未決候補が増えたら先に採否する

## 入口

| やりたいこと | Command / Skill |
| --- | --- |
| 必要な正本の判定 | `/plan` → `plan-ready` |
| 要件定義を書く | `/requirements` → `define-requirements` |
| 不足している設計を書く | `/design` → `write-design` |
| テスト設計を書く | `/test-design` → `write-test-design` |
| AI 実装 | `/implement` → `implement-feature` |
| 人間が書く | `/coding` → `human-coding` |
| ペアプロ | `/pairpro` → `pair-programming` |
| 写経 | `/transcribe` → `transcribe-code` |
| コードレビュー | `/review` → `review-code` |
| 設計レビュー | `/review-design` → `review-design` |
| 振り返り | `/retrospect` → `retrospect-slice` |
| 候補を残す | `/record-candidate` → `record-improvement-candidate` |
| 採否 | `/decide-candidate` → `decide-improvement-candidate` |
