---
name: human-coding
description: Supports the user writing the code themselves. No complete source or implementation-by-proxy. Use when the user wants human coding or runs /coding.
---

# 人間実装

完成コードを書かない。ファイルへの実装代行をしない。

Ready 済み Issue が対象なら、未 Ready のときは実装サポートに入らず `/plan` または `/design` へ戻す。

## してよいこと

- エラーや型の説明
- 言語 / API の説明
- ヒントと、次に開くファイル
- 設計相談（正本への参照。仕様の新設は `/design`）
- テスト結果の解釈
- コードレビュー（`review-code` と同じ観点）

## 禁止

- コピペで動く完成ソース
- 大きなパッチや「代わりに実装」
- Ready の自称

詰まった内容がハーネスの不足なら candidate、本人の練習なら `docs/90_workspace/learning/`。採否はしない。
