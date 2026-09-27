# ADR 010: Issue 起点の開発フロー

## 背景

ADR 009 のハーネスは、学びを候補として残すところまでを決めた。一方、実装 Skill は「正本を読んで着手する」形で、設計の有無を止め条件にしていなかった。GitHub Issue も、What の正として使っていなかった。

開発は AI 実装・人間実装・ペアプロを切り替える。入口を Issue に揃え、必要な設計が無いときは実装しない。

## 決定内容

- **Issue** は「何を作るか」の正（Goal / Why / Scope / Out of Scope / Acceptance Criteria と Ready 条件のチェックリスト）
- **docs/01〜09** は Specification / Design / Decision / Test Design の正。Issue に設計本文を複製しない
- **Change Types** は Issue 作成時の必須入力にしない。`/plan` が既存仕様とコードを見て確定する
- **実装開始** は Issue の Ready 条件が揃い、かつユーザーが Cursor 上で Ready を明示したときだけ
- 設計の執筆は `/design`。`implement-feature` は Ready 済み Issue の実装だけを行う
- ハーネス改善は `docs/90_workspace/harness/candidates/`。学習の隙間は `docs/90_workspace/learning/`。どちらも Issue にしない
- GitHub Project の列は一覧用であり、Ready の正本にしない（導入は後回し）

## なぜ Ready を Issue とチャットに分けるか

条件（仕様・必要設計・テスト設計・Implementation Plan）は Issue に無いと、次のセッションで再現できない。最後の承認だけチャットに置くのは、AI が「実装できるだろう」と Ready を自称しないためである。Project の Ready 列を正にすると、Issue と列の二重管理になる。

## なぜ Change Types を作成時に確定しないか

「お気に入りを足す」だけでは、永続化が要るか UI だけかは分からない。先に正解のチェックを要求すると、空の設計書か誤った範囲指定が先に来る。

## なぜ Specification / Design / Test Design を分けるか

仕様に実装手順を書くと、docs が第二のコードになり、Issue の AC とテスト設計が同じ文のコピーになる。何を実現するか、どう実現するか、何を検証するか、を混ぜない。

## 結果・利点

- 設計不足で実装が始まらない
- Issue に How が増えない
- 009 の候補ループを、スライスの振り返りから続けられる

## 考慮点・トレードオフ

- Ready まで工程が増える（軽微な変更は `/plan` が「その設計は不要」と理由つきで落とす）
- Issue チェックとチャット承認の両方を人間が行う

## 関連

- [ADR 009](./009-ai-dev-harness.md)
- 運用: `docs/90_workspace/harness/README.md`
- Issue と docs の分担: `docs/08_development/issue-workflow.md`
