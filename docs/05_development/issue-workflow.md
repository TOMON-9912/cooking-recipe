# Issue 起点の開発

判断理由は [ADR 010](../04_decisions/010-issue-centered-dev-flow.md)、[ADR 013](../04_decisions/013-issue-per-process.md)。手順の本体は `.cursor/skills/`（`/plan` `/requirements` `/design` `/test-design` `/implement` など）。

## 責務

| 置き場 | 正とするもの |
| --- | --- |
| GitHub Issue（親） | 開発対象。目的 / なぜ作るか / 含めること / 含めないこと / 完了条件 |
| GitHub Issue（プロセス別の子） | そのプロセスの進み具合と完了条件（チェックリスト）。実装 Issue には実装開始条件を置く。各子 Issue に、ブランチと PR が 1 つずつ対応する |
| Cursor チャット | 仕様書・設計書レビュー後の承認（ユーザーが明示したときだけ） |
| `docs/01_requirements`〜`04_decisions` | Requirements / Specification / Design / Test Design / ADR の本文 |
| GitHub Project | 一覧。使う場合も Ready の正本にはしない |

Issue に DB・画面・usecase の本文や、テストケース一覧を書かない。リンクとチェックだけ置く。

## プロセスごとの Issue・ブランチ・PR

1 つの開発対象（親 Issue）を、プロセスごとの子 Issue（GitHub の sub-issue）に分ける。**1 プロセス = 1 Issue = 1 ブランチ = 1 PR**。前のプロセスの PR がマージされてから、次のプロセスを始める。

```text
develop にいる
  → 親 Issue                                    /plan が下書きを作り、あなたの OK のあとに作る
  → /requirements   要件定義 Issue → ブランチ → 作業 → PR → マージ → Issue を閉じる
  → /design         設計 Issue     → ブランチ → 作業 → PR → マージ → Issue を閉じる
  → /test-design    テスト設計 Issue → ブランチ → 作業 → PR → マージ → Issue を閉じる
  → /implement      実装 Issue（操作ごと。Ready 未チェックで作る）
                    → あなたが Ready → ブランチ → 実装 → PR → マージ → Issue を閉じる
```

Issue は、**そのプロセスを始めるとき**に、そのプロセスの Skill が作る。前のプロセスの PR のマージを待ってから作る。

| 順 | Skill | 作る子 Issue | 作業ブランチ | PR に入れるもの |
| --- | --- | --- | --- | --- |
| 1 | `/requirements` | 要件定義 Issue | `docs/{Issue}-requirements-{slug}` | `docs/01_requirements`、必要な ADR |
| 2 | `/design` | 設計 Issue | `docs/{Issue}-design-{slug}` | 仕様・設計（`docs/02_design`、必要な ADR） |
| 3 | `/test-design` | テスト設計 Issue | `docs/{Issue}-test-design-{slug}` | `docs/03_test/design` |
| 4 | `/implement` | 実装 Issue（1 操作 1 つ） | `{種別}/{Issue}-{slug}`（`feature/` `fix/` など） | コード、テスト |

`{Issue}` は、そのプロセスの子 Issue の番号。`{slug}` は親の機能を表す英語の短い名前。

### 各プロセスの始め方

1. **場所を確かめる:** `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば、止まって聞く
2. **前のプロセスが終わっているか:** 前のプロセスの子 Issue が閉じていることを確かめる（`gh issue view {番号} --json state`）。開いていれば、止まって聞く（PR が未マージのことが多い）
3. **Issue を作る:** 親の子 Issue を確かめ（`gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues'`）、同じプロセスの Issue が無ければ、`gh issue create --parent {親}` で作る
4. **ブランチを切る:** `git switch -c {ブランチ名} origin/develop`。ローカルだけで、push しない
5. 作業する。終わったら、触ったファイルと PR 案（本文に `Closes #{そのプロセスの Issue}`）を示す。commit・push・PR は、依頼があるときだけ

### 守ること

- AI は子 Issue を閉じない。チェックも付けない（人間だけ）
- 親 Issue は、子がすべて閉じたら人間が閉じる
- 実装 Issue は、操作ごとに分ける（分け方は、要件定義の「進め方」と設計の操作の一覧に従う。決まっていなければ、案を示して聞く）
- 要件定義が不要な変更（挙動不変の整理など）は、`/plan` の判定に従い、必要なプロセスだけを回す
- 親 Issue は、`/plan` が下書きを出し、ユーザーが OK したあとに作る。親があれば作らない

### タイトル

Conventional Commits の種別で始める。要件定義は `docs(requirements): …`、設計は `docs(design): …`、テスト設計は `docs(test): …`、実装は `feat: …` / `fix: …` など親の種別に合わせる。

## Issue 本文の骨格

GitHub 上で人が作るときのひな形は `.github/ISSUE_TEMPLATE/`。AI が `gh` で作るときは、同じ項目で本文を書く。親の目的を再掲せず、docs の本文を貼らない。

### 要件定義 Issue

```markdown
親: #{親}

## 目的
この要件定義で、何を決めるか（1〜2 文）

## 成果物
- docs/01_requirements/{機能}.md

## 完了条件
- [ ] 要件定義書が書かれている
- [ ] 未決が決まっている、または設計に送ると要件定義書に明記されている
- [ ] 要件定義のレビュー
- [ ] 要件定義の確定
```

### 設計 Issue

```markdown
親: #{親}
前提: 要件定義 #{要件定義 Issue}

## 目的
この設計で、何を決めるか（1〜2 文）

## 成果物
書く場所（docs のパスだけ）
- 仕様（domain）/ 設計（database、application、api、ui など）

## 完了条件
- [ ] 必要な仕様が書かれている
- [ ] 必要な設計が書かれている
- [ ] 設計のレビュー
```

### テスト設計 Issue

```markdown
親: #{親}
前提: 要件定義 #{…}、設計 #{…}

## 目的
何を検証する設計を書くか（1〜2 文）

## 成果物
- docs/03_test/design/{関心事}/{操作}.md

## 完了条件
- [ ] 操作ごとのテスト設計が書かれている
- [ ] テスト設計のレビュー
```

### 実装 Issue

```markdown
親: #{親}
前提: 要件定義 #{…}、設計 #{…}、テスト設計 #{…}

## 目的
この操作で何を実現するか（1〜3 文）

## 含めること
## 含めないこと
## 完了条件
利用者から見て終わった状態。要件定義の受け入れ条件のうち、この操作の分

## 設計のリンク
正本のパスだけ

## 実装計画
スライス / 触る層 / 主なパス / 検証コマンド

## 実装開始条件
- [ ] 要件定義の確定
- [ ] 仕様の確定
- [ ] 必要な設計
- [ ] テスト設計
- [ ] 実装計画
- [ ] 仕様・設計のレビュー
- [ ] レビュー後の承認
```

## Ready 条件（実装 Issue）

```text
- [ ] 要件定義の確定
- [ ] 仕様の確定
- [ ] 必要な設計
- [ ] テスト設計
- [ ] 実装計画
- [ ] 仕様・設計のレビュー
- [ ] レビュー後の承認
```

各項目の中身は docs 側。要件定義は設計より先に書き、確定してから設計に進む（[ADR 012](../04_decisions/012-requirements-before-design.md)）。要件定義・設計・テスト設計の Issue が閉じている（PR がマージ済み）ことは、この条件の裏づけになる。

「仕様・設計のレビュー」は人間が正本を見た記録。「レビュー後の承認」は、そのレビューのあと Cursor 上で人間が宣言したときだけ成立する。AI はチェックを付けない。

変更種別は、親の作成時は空でよい。`/plan` が理由つきで確定する。

タイトルは Conventional Commits の種別で始める。`feat:` 固定ではない。追加は `feat:`（`add:` は使わない）。画面に閉じる変更は `feat(ui):` / `fix(ui):` のようにスコープを付ける。

## 文言の境界

| 種類 | 書くこと | 書かないこと |
| --- | --- | --- |
| Requirements | 何を・なぜ作るか（利用者の要求と要件） | テーブル、画面部品、関数名、手順 |
| Specification | 要件を満たすためのルール・状態・権限 | 要求の理由（要件定義へ）、テーブル、実装手順 |
| Design | システム内部でどう実現するか | ユーザー向けの「何ができるか」の再掲だけ |
| Test Design | 何をどう検証するか | AC のコピー、実装の擬似コード |
| 完了条件（Issue） | 利用者から見て終わった状態 | 設計・テストケースの本文 |

## BACKLOG.md

Inbox のまま残す。着手する仕事の正は Issue。全件移行はしない。
