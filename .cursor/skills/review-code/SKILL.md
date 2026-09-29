---
name: review-code
description: Reviews application code against project architecture, naming, and review checklist. Use when the user asks for a code review, runs /review, or wants feedback on a diff without editing files.
---

# コードレビュー

コードは編集しない。コメントだけ返す。

## 参照（本文はここにコピーしない）

- 観点一覧: `docs/90_workspace/reviews/00_レビュー観点.md`
- 依存・層: `.cursor/rules/clean-architecture.mdc`、`docs/01_architecture/overview.md`
- 命名: `.cursor/rules/file-naming.mdc`
- スタイル: `.cursor/rules/code-style.mdc`
- UI: `.cursor/rules/ui-design.mdc`
- 対象機能の正本: `docs/02_domain`〜`docs/07_testing` と `docs/09_decisions` の該当ページ

## 手順

1. 対象（パス、差分、ブランチ）を確認する。無ければ聞く
2. 上記の観点と、対象機能の Documentation を読む
3. 良い点と、重要度つきの改善点を具体的に書く
4. レビューで見つかったずれ・知識不足は、採否せず候補にする（`.cursor/skills/record-improvement-candidate/SKILL.md`）
5. 報告テンプレでレビュー結果を出す
6. **同じターンで必ず次の行動を問う。** 編集・採否・コミットには進まない

## レビュー後に必ず問うこと

報告の直後に AskQuestion を呼ぶ。使えないときは同じ内容を番号付きで聞く。ユーザーが答えるまで、指摘の修正や候補の Adopt はしない。

必須は次の 2 問。選択肢はレビュー内容に合わせて変えてよい。

1. **指摘のうち、どれを直すか**（複数可。「今は直さない」を必ず入れる）
2. **このレビューのあと何をするか**（次のどちらか、または状況に応じた同等の選択肢）
   - 選んだ指摘だけ直す
   - 直したあと候補を `/decide-candidate` する
   - 候補だけ `/decide-candidate` する（指摘はまだ直さない）
   - `/retrospect` する
   - このまま残す
   - コミットする（ユーザーが明示したときだけ実行）

AskQuestion の形（id は固定する）:

- `id: findings` / `allow_multiple: true` — 指摘の採否
- `id: after-review` — レビュー後の次アクション（単一）

## 報告

```markdown
# コードレビュー: {対象}

## 総合

| 観点 | 所見（短い文） |
| --- | --- |
| アーキテクチャ | |
| 可読性 | |
| 型・エラー | |
| セキュリティ | |

## 良い点

- ...

## 改善点

### 1. {題}（重要度: 高 / 中 / 低）

- 現状:
- 改善案:
- 理由:
- 正本の根拠（Rule / docs パス。無ければ「不足 → 候補」）:

## 学び

- ...

## 改善候補

作成したファイル、または「なし」
```

好みだけの指摘はしない。人格評定はしない。
