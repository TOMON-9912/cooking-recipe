---
name: create-issue
description: Creates a GitHub Issue for this repository, including the title and body. Use when creating a parent or child Issue, drafting an Issue title, or when another skill says to create an Issue.
---

# Issue を作る

親 Issue と、プロセスごとの子 Issue を作る。本文の骨格は `docs/05_development/issue-workflow.md`。AI は Issue を閉じない。チェックも付けない。

同じ内容の Issue が既にあれば作らない。

## タイトル

Conventional Commits の種別で始める。種別の後ろは名詞句にする。動詞や「〜する」で終えない。種別と、見出しで分かる言葉（要件定義、設計、実装）は重ねない。見出しの日本語は `.cursor/skills/write-japanese-doc/SKILL.md`。

| 種類 | 先頭 |
| --- | --- |
| 親 | `feat:` / `fix:` / `docs:` / `refactor:` / `chore:`。画面だけの変更は `feat(ui):` / `fix(ui):`。`add:` は使わない |
| 要件定義 | `docs(requirements):` |
| 設計 | `docs(design):` |
| 実装 | 親の種別に合わせる（`feat:` / `fix:` など） |

- 悪い例: `fix: 家族の作成を本人の1件に限る`
- 良い例: `fix: 本人1件の家族作成`
- 悪い例: `docs(requirements): 家族作成を本人の1件に限る要件定義`
- 良い例: `docs(requirements): 本人1件の家族作成`

## 本文

親の目的を再掲しない。docs の本文を貼らない。DB・画面・usecase の本文、テストケース一覧、設計や実装の手順は書かない。

| 種類 | 書くこと |
| --- | --- |
| 親 | 目的 / なぜ作るか / 含めること / 含めないこと / 完了条件 |
| 要件定義 | `docs/05_development/issue-workflow.md` の「要件定義 Issue」。成果物のパスは `/requirements` が決める |
| 設計 | 同「設計 Issue」。成果物のパスは `/design` が決める |
| 実装 | 同「実装 Issue」。完了条件と実装計画の中身は `/implement` が決める。実装開始のチェックリストは書かない |

## 手順

本文はファイルに書き、`gh issue create --title "…" --body-file {ファイル}` で作る。子は `--parent {親}` を付ける。

1. 子を作る前に、親の子を見る: `gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues' --jq '.[] | "\(.number) \(.state) \(.title)"'`
2. 同じプロセス（実装なら同じ操作）の Issue があれば、それを使う
3. 無ければ作る。番号と URL を示す
4. 次のプロセスの Issue は作らない

親は `/plan` が、無いときだけ作る。下書きを見せ、ユーザーが OK してから作る。ブランチは切らない。
