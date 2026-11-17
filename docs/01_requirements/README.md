# 要件定義

何を作るか、なぜ作るかを、利用者の視点でまとめる。実現方法（How）は書かない。設計の前に書き、レビューを受けてから `docs/02_design` へ進む。

新規は [_template.md](./_template.md) をコピーして `docs/01_requirements/{機能}.md` を書く。1 機能 1 ファイル。

## 開発の流れの中の位置

```text
GitHub Issue（目的・なぜ・範囲・完了条件）
  → /plan         どの正本が足りないかを判定する
  → /requirements 要件定義を書く（このディレクトリ）
  → 要件定義のレビュー
  → /design       設計を書く（02_design）
  → /test-design  テスト設計を書く（03_test/design）
  → /implement    設計 Issue、または設計を作らないときの要件定義 Issue が閉じたあと、実装 Issue を作って実装
  （各プロセスは、Issue・ブランチ・PR を 1 つずつ。前の PR のマージ後に始める）
```

## 何を書き、何を書かないか

| 種類 | 置き場 | 書くこと | 書かないこと |
| --- | --- | --- | --- |
| Issue | GitHub | 開発対象。短い目的・理由・範囲・完了条件 | 要件の一覧、設計 |
| 要件定義 | `01_requirements` | 背景・目的、利用者の要求、要件、スコープ・制約、受け入れ条件。ほかは必要なときだけ | テーブル、画面部品、関数名、手順。空の節 |
| 仕様 | `02_design/domain` ほか | 要件を満たすためのルール・状態・権限・失敗の意味 | なぜ作るか（要件定義へ） |
| 設計 | `02_design` | 内部でどう実現するか | 要求の再掲だけ |
| テスト設計 | `03_test/design` | 何をどう検証するか | 受け入れ条件のコピー |

要件に無いものを、仕様や設計で足さない。足したくなったら、要件定義に戻して人間が決める。

## 書き方の目安

最初から全節を埋めない。要求を整理し、曖昧なところをはっきりさせていく。まだ言えないことは書かず、空の節は残さない。

必ず書くのは次の5つ。

| 節 | 答える問い |
| --- | --- |
| 背景・目的 | なぜこの機能が必要なのか |
| 利用者の要求 | 誰が何を実現したいのか |
| 要件 | システムに何ができればよいのか |
| スコープ・制約 | 今回どこまで対応するのか |
| 受け入れ条件 | 何をもって完成とするのか |

必要になったときだけ書く。

- 非機能要件
- 前提・決定済み
- 未決・リスク
- 設計への申し送り
- 関連 Issue / ADR

- ファイル先頭の YAML だけがメタデータで、Obsidian のプロパティになる。本文は通常のマークダウンで書く
- 文書にステータス（草案、レビュー済み、確定）は書かない
- **要求**は利用者の言葉で書く。言い回しは固定しない
- **要件**は「〜できる」「〜であること」と書き、ID（`FR-01`）を付ける。どの要求に応えるかを添える。非機能は `NFR-01` とし、必要なときだけ書く
- 方式の選択（リンクかコードか、など）は設計の判断。利用者がすでに決めていることは「前提・決定済み」に書き、理由は ADR にリンクする
- 未決があるときは「未決・リスク」に書く。決まるまで設計に持ち込まない。未決が無ければ、その節は書かない

## 一覧

| 機能 | ファイル | Issue |
| --- | --- | --- |
| 家族グループへのメンバー追加 | [family-member-join.md](./family-member-join.md) | [#37](https://github.com/TOMON-9912/cooking-recipe/issues/37) |
| Node.js のセキュリティ更新への追従 | [node-security-update.md](./node-security-update.md) | [#46](https://github.com/TOMON-9912/cooking-recipe/issues/46) |
| 2026年11月の Node.js セキュリティ更新への追従 | [node-november-security-update.md](./node-november-security-update.md) | [#58](https://github.com/TOMON-9912/cooking-recipe/issues/58) |
| 待ち時間のローディングスピナー | [loading-spinner.md](./loading-spinner.md) | [#53](https://github.com/TOMON-9912/cooking-recipe/issues/53) |
| レシピ手順の画像追加機能の削除 | [recipe-instruction-image.md](./recipe-instruction-image.md) | [#65](https://github.com/TOMON-9912/cooking-recipe/issues/65) |
