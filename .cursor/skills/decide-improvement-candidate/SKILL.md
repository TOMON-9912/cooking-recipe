---
name: decide-improvement-candidate
description: Applies a human Adopt, Defer, or Reject decision to one improvement candidate. Use when the user names a candidate file and a decision, or runs /decide-candidate.
---

# 改善候補の採否

人間が **ファイル** と **Adopt / Defer / Reject** を指定したときだけ動く。AI が結果を選ばない。指定が無ければ聞いて止める。

基準の説明: `docs/90_workspace/harness/adoption-criteria.md`
配置: `docs/90_workspace/harness/placement-criteria.md`

## 共通

1. 指定された `docs/90_workspace/harness/candidates/*.md` を読む
2. 候補の Decision 欄を更新する（結果・日付・理由・実際に変えたファイル）
3. Status を `adopted` / `deferred` / `rejected` にする

## Adopt

- 原則、候補の **Target 1 箇所だけ** を更新する
- 2 ファイル以上必要なら、変更せず人間に確認する
- Target 別:
  - `Rule` → `.cursor/rules/` の該当 1 ファイル（新規 alwaysApply は原則作らない）
  - `Skill` → `.cursor/skills/` の該当 1 ファイル
  - `Documentation` → `docs/01`〜`docs/09` の該当 1 ファイル
  - `Judgment` → ハーネス知識は更新しない。Decision に「今回限り」と書く
- 仕様を Rule にコピーしない。既存文の重複・矛盾を増やさない
- この Adopt は、Target が Rule / Skill ならハーネス変更の明示依頼とみなす

## Defer / Reject

Rule / Skill / Documentation は変えない。理由だけ候補に残す。ファイルは削除しない。

## 報告

- 結果
- 更新したパス（なければなし）
- 次に人間が見るもの（未決候補の有無など、短く）
