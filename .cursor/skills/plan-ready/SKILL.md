---
name: plan-ready
description: Reads a GitHub Issue, determines change types, and lists required designs with reasons. Use when planning a slice, checking Ready gaps, or running /plan.
---

# スライス計画

コードは実装しない。docs 本文も書かない（書くのは `/design`）。Ready も付けない。

Issue 番号が無ければ聞く。作成時点の Change Types は空でよい。ここで確定する。

## 手順

1. Issue の Goal / Why / Scope / Out of Scope / AC を読む
2. 既存の `docs/01`〜`09` と、関係する実装を必要な分だけ見る
3. Change Types を確定する（作成時のチェックを正解扱いしない）
4. 必要な Specification / Design / Test Design を、**理由つき**で出す。変更しない層は要求しない
5. 不足があれば列挙して `/design` へ戻す。Implementation Plan は、必要な正本が揃ってから出す
6. 判断が要る（採用する案が複数、範囲が曖昧）なら止まって聞く

## Change Types と docs

| 種別 | 見る正本 |
| --- | --- |
| Domain | `docs/02_domain` |
| Database | `docs/03_database` |
| Application | `docs/04_application` |
| API | `docs/05_api` |
| UI | `docs/06_ui` |
| Test strategy | `docs/07_testing` |
| ADR | `docs/09_decisions` |

「お気に入りを足す」だけでは種別は決まらない。永続化が要るか、既存概念か、画面だけかを見てから書く。

## 文言

- Specification: 何を実現するか
- Design: 内部でどう実現するか
- Test Design: 何をどう検証するか（AC のコピーにしない）
- 不要な設計は「不要」と理由だけ書く。空の設計書を作らせない

Test Design が不要なとき（挙動不変の文言修正など）は、理由を書いて Issue 上は人間が Test Design をチェックする。

## 報告

```markdown
# Plan: Issue #N

## Change Types
- Database: 必要
  理由: …
- API: 不要
  理由: …

## Required Design
### docs/03_database
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

## 次
不足がある → /design
揃っている → 人間が Issue の Ready 条件を付け、チャットで Ready を宣言する
```

Issue のチェックボックスは人間が付ける。AI は `gh` で Ready を更新しない。
Design links / Implementation Plan / Change Types を Issue に反映するのは、人間が依頼したときだけ。
