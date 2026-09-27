# Issue 起点の開発

判断理由は [ADR 010](../09_decisions/010-issue-centered-dev-flow.md)。手順の本体は `.cursor/skills/`（`/plan` `/design` `/implement` など）。

## 責務

| 置き場 | 正とするもの |
| --- | --- |
| GitHub Issue | 開発対象。Goal / Why / Scope / AC。Ready **条件**のチェックリスト |
| Cursor チャット | Human Approved（ユーザーが Ready と明示したときだけ） |
| `docs/01`〜`09` | Specification / Design / Test Design / ADR の本文 |
| GitHub Project | 一覧。使う場合も Ready の正本にはしない |

Issue に DB・画面・usecase の本文や、テストケース一覧を書かない。リンクとチェックだけ置く。

## Ready 条件（Issue）

```text
- [ ] Specification
- [ ] Required Design
- [ ] Test Design
- [ ] Implementation Plan
- [ ] Human Approved
```

各項目の中身は docs 側。Human Approved は Cursor 上の宣言で成立する。AI はチェックを付けない。

Change Types は作成時は空でよい。`/plan` が理由つきで確定する。

## 文言の境界

| 種類 | 書くこと | 書かないこと |
| --- | --- | --- |
| Specification | 何を実現するか | テーブル、Repository、実装手順 |
| Design | システム内部でどう実現するか | ユーザー向けの「何ができるか」の再掲だけ |
| Test Design | 何をどう検証するか | AC のコピー、実装の擬似コード |
| Acceptance Criteria（Issue） | 利用者から見て終わった状態 | 設計・テストケースの本文 |

## BACKLOG.md

Inbox のまま残す。着手する仕事の正は Issue。全件移行はしない。
