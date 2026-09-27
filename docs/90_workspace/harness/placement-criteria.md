# Rule / Skill / Documentation の配置

迷ったらこの順で聞く。

1. いつでも守り、破ったら実装として不正か → **Rule**
2. 特定作業の手順・チェックか → **Skill**
3. このアプリで何が正しいか（仕様・判断理由）か → **Documentation（01〜09）**
4. まだ採否していない学びか → **Candidate**
5. 今回限りで、次に知識として残す必要がないか → 候補の Target を **Judgment**
6. 人間が次に練習することか → **Learning**（`docs/90_workspace/learning/`）。Candidate にも Issue にもしない
7. 何を作るか（Goal / Scope / AC / Ready 条件）か → **GitHub Issue**。設計本文は置かない

## Rule にしない

手順、長い説明、テーブル定義、画面文言、ユースケースの詳細、改善候補のテンプレート。

## Skill にしない

クリーンアーキの依存方向など、既に Rule にある文の再掲（「`.cursor/rules/clean-architecture.mdc` に従う」と指す）。

仕様の全文（「更新時は材料も RPC で置き換える」は `docs/04_application` / ドメイン設計書）。

## Documentation にしない

「コミットするな」「絵文字を使うな」など、プロダクトではなく開発制約であるもの。

ペアプロ中の学習用メモは `docs/90_workspace/work/`。Ready には数えない。確定した正本は人間が `docs/01`〜`09` へ置く。

## Specification / Design / Test Design

| 種類 | 意味 | 主な置き場 |
| --- | --- | --- |
| Specification | 何を実現するか | `docs/02_domain`。受け入れの一文は Issue の AC |
| Design | 内部でどう実現するか | 変更する層だけ（`01` / `03` / `04` / `05` / `06`）。判断は `09` |
| Test Design | 何をどう検証するか | 操作メモ（`04` / `06`）の検証節。戦略の変更だけ `07` |

仕様に Repository 名や手順を書かない。Test Design を AC のコピーにしない。

## Ready

条件の正は Issue のチェックリスト。Human Approved はチャットでの明示。Project 列は正本にしない。

## 正本の対応

| 内容 | 正本 |
| --- | --- |
| 層と依存 | `docs/01_architecture` と `clean-architecture.mdc` |
| 業務ルール | `docs/02_domain` |
| テーブル・RLS | `docs/03_database` |
| 操作の実装メモ | `docs/04_application` |
| 画面 | `docs/06_ui` |
| テスト方針 | `docs/07_testing` |
| 開発手順 | `docs/08_development` |
| なぜそうしたか | `docs/09_decisions` |
