---
name: plan-ready
description: Reads a GitHub Issue, determines change types, and lists required docs (requirements, design, test design) with reasons. Use when planning a slice, checking Ready gaps, or running /plan.
---

# スライス計画

コードは実装しない。docs 本文も書かない（要件は `/requirements`、設計は `/design`）。Ready も付けない。

親 Issue の番号が無ければ聞く。作成時点の変更種別は空でよい。ここで確定する。

このスキルが作る Issue は、**親 Issue だけ**（無いときに限る）。要件定義・設計・テスト設計・実装の子 Issue は、各プロセスの Skill が、そのプロセスを始めるときに作る（`docs/05_development/issue-workflow.md`）。

## 手順

1. Issue の目的 / なぜ作るか / 含めること / 含めないこと / 完了条件を読む
2. 既存の `docs/01_requirements`〜`docs/04_decisions` と、関係する実装を必要な分だけ見る
3. 変更種別を確定する（作成時のチェックを正解扱いしない）
4. 必要な Requirements / Specification / Design / Test Design を、**理由つき**で出す。変更しない層は要求しない
5. 不足があれば列挙して、戻る先を示す。**要件定義の不足は `/requirements` が先。設計は要件が確定してから**
6. Implementation Plan は、必要な正本が揃ってから出す
7. 判断が要る（採用する案が複数、範囲が曖昧）なら止まって聞く

## 親 Issue

開発対象を表す親 Issue が無いときだけ、このスキルが作る。`develop` にいるうちに作る（ブランチは切らない）。

1. ユーザーの説明から、親 Issue の下書き（種別 / 目的 / なぜ作るか / 含めること / 含めないこと / 完了条件）を作って見せる。判断が要る箇所は聞く
2. ユーザーが OK したあとに、`gh issue create` で作る。本文に設計や実装の手順を書かない
3. 親が既にあれば作らない

子 Issue（要件定義・設計・テスト設計・実装）、ブランチ、チェックボックスは、このスキルでは作らない・付けない。

## 要件定義が要るか

新機能や、利用者に見える振る舞いの変更では、設計の前に要件定義が要る。理由を書く。

要件定義が不要なとき（挙動不変の整理、文言だけの修正など）は、理由を書く。Issue 上は人間が「要件定義の確定」をチェックする。

## 変更種別と docs

| 種別 | 見る正本 |
| --- | --- |
| Requirements | `docs/01_requirements` |
| Domain | `docs/02_design/domain` |
| Database | `docs/02_design/database` |
| Application | `docs/02_design/application` |
| API | `docs/02_design/api` |
| UI | `docs/02_design/ui` |
| Test design | `docs/03_test/design` |
| Test strategy | `docs/03_test` |
| ADR | `docs/04_decisions` |

「お気に入りを足す」だけでは種別は決まらない。永続化が要るか、既存概念か、画面だけかを見てから書く。

## 文言

- Requirements: 何を・なぜ作るか（利用者の要求と要件）
- Specification: 要件を満たすためのルール・状態・権限・失敗の意味
- Design: 内部でどう実現するか
- Test Design: 何をどう検証するか（AC のコピーにしない）
- 不要な設計は「不要」と理由だけ書く。空の設計書を作らせない

Test Design が不要なとき（挙動不変の文言修正など）は、理由を書いて Issue 上は人間が Test Design をチェックする。

## 報告

```markdown
# Plan: Issue #N

## 変更種別
- Database: 必要
  理由: …
- API: 不要
  理由: …

## Requirements
必要または不要（理由）
現状: あり（path） / 不足 / 不要

## Required Design
### docs/02_design/database
理由: …
現状: あり（path） / 不足

## Specification
現状: あり（path） / 不足

## Test Design
必要または不要（理由）
現状: あり（path） / 不足 / 不要

## Implementation Plan
（正本が揃っているときだけ）
- スライス:
- 層:
- 主なパス:
- 検証コマンド:

## 親 Issue
#N（既存 / 今回作成）

## 次
要件定義が不足 → /requirements
要件は確定済みで設計が不足 → /design
設計は済みでテスト設計が不足 → /test-design
揃っている → 人間が要件・仕様・設計をレビューし、Issue の実装開始条件を付け、チャットでレビュー後の承認を宣言する
```

Issue のチェックボックスは人間が付ける。AI は `gh` で Ready を更新しない。
設計のリンク / 実装計画 / 変更種別を既存の Issue に反映するのは、人間が依頼したときだけ。
