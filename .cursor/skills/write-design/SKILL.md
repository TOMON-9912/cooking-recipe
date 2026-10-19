---
name: write-design
description: Writes only the missing product docs for a planned slice. Use when filling specification, design, or test design, or running /design.
---

# 設計を書く

実装しない。`/plan` が示した不足分だけを `docs/01`〜`09` に書く。判断が複数あるときは草案を出して止まる。

`docs/90_workspace/work/` への下書きは Ready に数えない。正本は 01〜09。

## 混ぜない

| 種類 | 書く | 書かない |
| --- | --- | --- |
| Specification | 何を実現するか | テーブル、Repository、手順 |
| Design | 内部でどう実現するか | 「ユーザーができること」だけの再掲 |
| Test Design | 何をどう検証するか | AC の全文コピー、完成コード |

Issue に設計本文を複製しない。パスを Design links に足すのは人間の依頼時だけ。

## 置き場

- Specification → 主に `docs/02_domain`
- Design → 変更する層だけ（`01` / `03` / `04` / `05` / `06`）。判断理由は `09`
- Test Design → 該当する `04` または `06` の検証節。テスト戦略自体の変更だけ `07`

## 完了

書いたパスと、まだ人間が決めることを列挙する。実装へ進まない。Ready は付けない。
