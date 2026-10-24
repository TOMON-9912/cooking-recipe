---
name: record-improvement-candidate
description: Writes one harness improvement candidate file from a review finding or knowledge gap. Use when recording a candidate, after /review findings, when the user runs /record-candidate, or when current Rules / Skills / docs are insufficient to decide.
---

# 改善候補を残す

採否はしない。Rule / Skill は変更しない。ファイルを 1 つ作って止める。

## 置き場

`docs/90_workspace/harness/candidates/YYYYMMDD-short-description.md`

- `short-description` は英小文字とハイフン
- ひな形: `docs/90_workspace/harness/candidate-template.md`
- 置き場の判断: `docs/90_workspace/harness/placement-criteria.md`

## 手順

1. `candidates/` に、同じ Problem で Status が `proposed` のファイルが無いか見る。あれば追記（Recurrence）し、新規は作らない
2. Trigger / Fact / Problem / Root cause / Missing knowledge を、解釈を混ぜずに書く
3. Proposed change は **1 箇所・1 文**。複数変更が必要なら、人間に分割を確認してから 1 件だけ書く
4. Target を 1 つ選ぶ
   - 常時の不変条件 → `Rule`
   - 特定作業の手順 → `Skill`
   - このアプリ固有の事実 → `Documentation`
   - 今回限りで残さない → `Judgment`
5. Source を 1 つ選ぶ
   - 人間の指摘 → `human-review`
   - コード上の問題を AI が見つけた → `ai-review`
   - 今の Rule / Skill / docs では判断材料が足りない → `ai-gap`
6. Status は `proposed`。Decision は「未決」
7. 作成したパスをチャットで知らせ、採否は人間に任せる

Adopt / Defer / Reject を書かない。推奨の Target を選ぶことは可。採用基準の適用は `decide-improvement-candidate` 側。
