# AI 開発ハーネス

チャットで指示し、Issue から設計を経て実装し、学びを **人間の採否を経て** 次回へ残す作業領域。プロダクト仕様の正本ではない。正本は `docs/01`〜`docs/09`。

判断の理由は [ADR 009](../../09_decisions/009-ai-dev-harness.md) と [ADR 010](../../09_decisions/010-issue-centered-dev-flow.md)。Issue と docs の分担は [issue-workflow.md](../../08_development/issue-workflow.md)。

## 目的

- Issue を「何を作るか」の入口にする
- 必要な設計が無いときは実装しない
- 指摘とレビューを、ハーネスまたは学習ログへ候補として返し、採用は人間が決める

## 開発フロー

```
GitHub Issue（What / Why / Scope / AC）
  → /plan（Change Types 確定、必要設計と理由、不足なら停止）
  → /design（不足している正本だけ。仕様・設計・テスト設計を混ぜない）
  → Issue の Ready 条件
  → 人間がチャットで Ready
  → /implement または /coding または /pairpro
  → 検証 → /review → PR（明示依頼時）
  → /retrospect
```

全工程は強制しない。`/plan` が「なぜその設計が要るか」を書き、不要な層は要求しない。`work/` の下書きは Ready に数えない。

## Ready の責務

| 置き場 | 役割 |
| --- | --- |
| Issue | Ready **条件**の正（チェックリスト。本文は docs） |
| Cursor | Human Approved だけ（ユーザーの明示） |
| Project | 一覧。正本にしない |

AI は Ready を付けない。Human Approved を自分で成立させない。

## 全体構造

| 場所 | 役割 |
| --- | --- |
| GitHub Issue | 開発対象と Ready 条件 |
| `.cursor/rules/` | 常時の不変条件 |
| `.cursor/skills/` | 工程の手順 |
| `.cursor/commands/` | 工程の入口 |
| `docs/01`〜`09` | Specification / Design / Decision / Test Design |
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
| Ready | 条件の不足を指摘する | Issue チェックとチャットでの承認 |
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
| 必要設計の判定 | `/plan` → `plan-ready` |
| 不足 docs を書く | `/design` → `write-design` |
| AI 実装 | `/implement` → `implement-feature` |
| 人間が書く | `/coding` → `human-coding` |
| ペアプロ | `/pairpro` → `pair-programming` |
| 写経 | `/transcribe` → `transcribe-code` |
| レビュー | `/review` → `review-code` |
| 振り返り | `/retrospect` → `retrospect-slice` |
| 候補を残す | `/record-candidate` → `record-improvement-candidate` |
| 採否 | `/decide-candidate` → `decide-improvement-candidate` |
