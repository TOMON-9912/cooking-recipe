---
name: define-requirements
description: Writes the requirements definition (what to build and why) for one slice before design. Use when a requirements gap is found by /plan, before /design, or when running /requirements.
---

# 要件定義を書く

設計の前に、何を作るか・なぜ作るかをまとめる。実装しない。設計しない。書くのは `docs/01_requirements/{機能}.md` だけ。

「要件定義の確定」は人間のレビューのあとに成立する。AI は Issue のチェックを付けない。

## 手順

1. Issue（目的 / なぜ作るか / 含めること / 含めないこと / 完了条件）を読む。番号が無ければ聞く
2. `docs/01_requirements/` に既存の要件があれば、差分だけ直す
3. 関係する ADR・`docs/02_design/domain`・現状の実装を、**現状の事実を確かめる分だけ**見る
4. `docs/01_requirements/_template.md` をコピーして書く
5. `docs/01_requirements/README.md` の一覧に 1 行足す
6. 利用者がまだ決めていない判断（方式、範囲、優先度、期間など）は書かない。選択肢と推奨を示し、AskQuestion で聞いて止まる
7. 書き終えたらレビューを求める。設計には進まない

## 書く章

背景と課題 / なぜ作るか / 利用者と要求 / 要件（`FR-` 機能、`NFR-` 非機能。応える要求を添える）/ スコープ / 前提・決定済み / 受け入れ条件 / 未決・リスク / 設計への申し送り。

## 混ぜない

| 書く | 書かない |
| --- | --- |
| 利用者の言葉の要求、「〜できる」「〜であること」の要件 | テーブル、画面部品、関数名、実装手順 |
| 利用者がすでに決めたこと（出典つき。理由は ADR へリンク） | 方式を AI が決めること |
| 受け入れ条件（利用者から見て終わった状態） | テストケースの本文（`docs/03_test/design`） |
| 未決と、設計に持ち込まないこと | 未決を仮に決めて書くこと |

- Issue と二重管理しない。受け入れ条件は Issue の完了条件と矛盾させない
- 業務ルール（不変条件・状態・権限）は仕様。`docs/02_design/domain` に書く
- 要件に無いことを、あとの仕様・設計で足さない

## 完了

書いたパスと、人間が決めること（未決）を列挙する。次は人間による要件定義のレビュー。確定したら `/design`。実装へ進まない。Ready は付けない。
