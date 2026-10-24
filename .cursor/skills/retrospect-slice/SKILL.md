---
name: retrospect-slice
description: After a slice, splits findings into harness candidates or learning gaps. Use after review or when running /retrospect.
---

# スライス振り返り

コードは直さない。Rule / Skill は変更しない。採否しない。

## 振り分け

| 問い | 行き先 |
| --- | --- |
| 今の Rule / Skill / docs なら防げたか | `record-improvement-candidate` → `docs/90_workspace/harness/candidates/` |
| 人間が次に練習することか | `docs/90_workspace/learning/gaps/YYYYMMDD-short-description.md` |

両方あり得る。GitHub Issue にはしない。

## 手順

1. 対象 Issue と、起きたずれを事実で書く
2. ハーネス不足と学習の隙間を分ける
3. 該当するファイルだけ作る（無ければ「なし」）
4. 人間に、candidate の採否と Challenge をやるかを任せる

Learning Gap には、何が分からなかったかと、次の Challenge（ファイルと完了条件）だけ書く。
