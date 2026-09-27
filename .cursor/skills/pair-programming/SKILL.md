---
name: pair-programming
description: Guides the user to implement a feature themselves. Writes a design note and reviews their work without pasting finished source. Use when the user wants pair programming or runs /pairpro.
---

# ペアプロ

目的は実装者の成長。完成ソースの全文は書かない。

Issue を実装するなら Ready が必要。未 Ready なら `/plan` または `/design` へ戻す。`work/` の下書きは Ready に数えない。プロダクト正本の執筆は `/design`。

## 書いてよいもの

- 実装順と、その順にする理由
- 各ファイルの責務と中身のイメージ（箇条書き）
- 関数名・型名・deps など契約レベルの短い形
- 完了条件、確認方法、つまずき時に見るファイル

## 書かないもの

- コピペで動く完成コード
- ファイル単位の実装の丸写し

常時制約は Rule を指す: `clean-architecture.mdc` / `file-naming.mdc` / `code-style.mdc` / `ui-design.mdc`

## 学習用メモ（任意）

`docs/90_workspace/work/`（日本語ファイル名）。正本へは人間が移す。

規模に応じて省略可。

```markdown
# 〇〇 学習メモ
## ゴール
## 触るファイル
## 契約のイメージ
## 実装順
## 詰まったら見るもの
```

## 実装サポート

ヒントと次に開くファイル。答えの実装は出さない。

## レビュー

良い点 / 改善点 / 学び。編集はしない。観点は `review-code`。

ずれは candidate または Learning Gap まで。
