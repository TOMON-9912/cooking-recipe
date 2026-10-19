---
name: review-design
description: Reviews specification and design docs against confirmed requirements, with extra weight on authorization, RLS, PII, secrets, and information leakage. Use when reviewing docs/02_design, a design Issue, running /review-design, or when the user asks for a design review.
---

# 設計書レビュー

設計書はレビュー中に編集しない。指摘はチャットと、**レビュー 1 回につき 1 ファイル**にまとめて残す。

コードレビューは `review-code`。テスト設計のレビューは設計が確定してから。

## 参照（本文はここにコピーしない）

- 観点の詳細: [checklist.md](checklist.md)
- 要件・仕様・設計の分け方: `.cursor/skills/write-design/SKILL.md`、`docs/02_design/domain/writing-guide.md`
- 対象機能の正本: `docs/01_requirements`〜`docs/04_decisions` の該当ページ
- ひな形: `docs/02_design/**/_template.md`
- ハーネス候補: `.cursor/skills/record-improvement-candidate/SKILL.md`

## 始める前

1. 対象の設計 Issue（またはブランチ・パス）を確認する。無ければ聞く
2. 対応する要件定義があること、ステータスが確定していることを確認する。無ければ `/requirements` へ戻し、設計レビューをしない
3. 差分は `git status` / `git diff` で取る。未追跡の設計書も対象に含める
4. 設計が段階の途中なら、**今の段階のパスだけ**を対象にする（データ系 / バックエンド / フロントエンド）。全ファイルを一度に見ない

## 手順

1. 要件の FR / NFR、受け入れ条件、設計への申し送り、未決を読む
2. 変更した層の設計書（domain / database / application / ui / ADR）を、要件 ID と突き合わせる
3. [checklist.md](checklist.md) の標準観点と、**セキュリティ観点を厚く**見る
4. 良い点と、重要度つきの改善点を書く。好みだけの指摘はしない
5. このレビュー回の記録ファイルを **1 つ**作る（指摘をファイル分割しない）
6. ハーネスのずれ・知識不足は、採否せず候補にする
7. 報告テンプレで出して止める。指摘の採否も、レビューのあと何をするかも聞かない。修正・採否・コミットは、ユーザーが別の指示をしたときだけ

## 記録ファイル

置き場: `docs/90_workspace/reviews/findings/`

**レビュー 1 回 = ファイル 1 つ。** 指摘の数だけファイルを増やさない。同じ Issue を日を空けて再レビューするときは、日時が違う別ファイルにする。

ファイル名:

```text
{Issue番号}-{Issueタイトルのファイル名向け}-{YYYYMMDD-HHmm}.md
```

- Issue タイトルは `:` `/` を `-` にし、括弧を外す。空白は詰めてもハイフンでもよい
- 日時はレビュー開始の JST
- 例: `42-docs-design-家族グループへのメンバー追加の設計-20261019-1533.md`

チャットで直した指摘は、**同じファイル**の指摘一覧と当該節の「状態」を `対応済み` にし、「対応」に日付と何をしたかを追記する。新規ファイルは作らない。

## レビュー後

聞かない。どの指摘を直すか、次に何をするかは、ユーザーが自分で決める。AskQuestion で採否や次の行動を尋ねない。

報告のあと、そのフェーズの Skill を読む（設計レビューなら `write-design`）。今回のレビューで、手順が足りない、または手順が成果物を増やしていると分かった箇所だけを、その Skill に直す。指摘を設計書やコードへ反映することは、この見直しに含めない。

## 報告

チャットの報告と記録ファイルは、同じ章立てにする。

```markdown
# 設計レビュー: #{Issue} {タイトル}

| 項目 | 内容 |
| --- | --- |
| Issue | |
| 親 Issue | |
| レビュー日時 | YYYY-MM-DD HH:mm JST |
| 対象ブランチ | |

## 総合

| 観点 | 所見（短い文） |
| --- | --- |
| 要件との対応 | |
| 仕様と設計の分離 | |
| 層の抜け | |
| セキュリティ | |
| 未決の扱い | |

## 指摘一覧

| # | 題 | 重要度 | 状態 |
| --- | --- | --- | --- |
| 1 | | 高 / 中 / 低 | 未対応 |

## 良い点

- ...

## 改善点

### 1. {題}（重要度: 高 / 中 / 低）

- 状態: 未対応
- 現状:
- 改善案:
- 理由:
- 正本の根拠:
- 対応: なし

## FR / NFR の抜け

| ID | 設計での扱い | 判定 |
| --- | --- | --- |
| FR-01 | | 足りる / 不足 / 矛盾 |

申し送りで未処理のものも行にする。

## 改善候補

作成したファイル、または「なし」
```

人格評定はしない。要件に無い機能の追加提案は、指摘ではなく「要件定義へ戻す案」として扱う。
