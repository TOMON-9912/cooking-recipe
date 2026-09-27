# Issue 起点の開発

判断理由は [ADR 010](../09_decisions/010-issue-centered-dev-flow.md)。手順の本体は `.cursor/skills/`（`/plan` `/design` `/implement` など）。

## 責務

| 置き場 | 正とするもの |
| --- | --- |
| GitHub Issue | 開発対象。目的 / なぜ作るか / 含めること / 完了条件。実装開始条件のチェックリスト |
| Cursor チャット | 仕様書・設計書レビュー後の承認（ユーザーが明示したときだけ） |
| `docs/01`〜`09` | Specification / Design / Test Design / ADR の本文 |
| GitHub Project | 一覧。使う場合も Ready の正本にはしない |

Issue に DB・画面・usecase の本文や、テストケース一覧を書かない。リンクとチェックだけ置く。

## Ready 条件（Issue）

```text
- [ ] 仕様の確定
- [ ] 必要な設計
- [ ] テスト設計
- [ ] 実装計画
- [ ] 仕様・設計のレビュー
- [ ] レビュー後の承認
```

各項目の中身は docs 側。「仕様・設計のレビュー」は人間が正本を見た記録。「レビュー後の承認」は、そのレビューのあと Cursor 上で人間が宣言したときだけ成立する。AI はチェックを付けない。

変更種別は作成時は空でよい。`/plan` が理由つきで確定する。

タイトルは Conventional Commits の種別で始める。`feat:` 固定ではない。追加は `feat:`（`add:` は使わない）。画面に閉じる変更は `feat(ui):` / `fix(ui):` のようにスコープを付ける。

## 文言の境界

| 種類 | 書くこと | 書かないこと |
| --- | --- | --- |
| Specification | 何を実現するか | テーブル、Repository、実装手順 |
| Design | システム内部でどう実現するか | ユーザー向けの「何ができるか」の再掲だけ |
| Test Design | 何をどう検証するか | AC のコピー、実装の擬似コード |
| 完了条件（Issue） | 利用者から見て終わった状態 | 設計・テストケースの本文 |

## BACKLOG.md

Inbox のまま残す。着手する仕事の正は Issue。全件移行はしない。
