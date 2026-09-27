---
name: implement-feature
description: Implements one Ready GitHub Issue end-to-end under Clean Architecture. Use when the user has declared Ready and runs /implement.
---

# 機能実装（Ready 済み Issue）

**1 操作 = 1 スライス = 1 PR**。設計は書かない。完成コードはファイルに書く。

常時制約: `clean-architecture.mdc` / `file-naming.mdc` / `code-style.mdc` / `ui-design.mdc` / `git-workflow.mdc` / `harness-governance.mdc`

## 実装してよいか

次が揃うまで **1 行も実装しない**。足りないものは `/plan` または `/design` へ戻す。

1. Issue（番号または URL）がある
2. Issue の Ready 条件が付いている: Specification / Required Design / Test Design / Implementation Plan
3. **このチャットで** ユーザーが Ready を明示している（「Ready」「この設計で Ready。/implement」など）
4. Implementation Plan と、変更種別に対する正本がある
5. 未確定の判断が無い

AI が「まあ実装できる」と判断して進まない。Issue の Human Approved を AI が付けない。

`docs/04` が無いからスコープを短く宣言して着手する、ことはしない。

未 Ready の停止例:

```text
DB 変更が必要なのに docs/03_database に該当設計がありません。
実装を開始しません。/design で DB 設計を確定してください。
```

## 着手後

正本と Implementation Plan に従い、必要な層だけ下から実装する。

```
domain/models → domain/repositories → infrastructure → usecase → app → presentation
```

| 層 | この操作でやること |
| --- | --- |
| domain | 不足している型・interface だけ |
| infrastructure | `{関心事}-repository-impl.ts`、snake_case 変換、単体テスト |
| usecase | `{操作}-{関心事}-usecase.ts`、deps、バリデーション、単体テスト |
| app | Action で deps 組み立て、認証・パース・エラー整形、単体テスト |
| presentation | UI。Action だけ呼ぶ |

参考: `src/usecase/recipe/`、`src/usecase/family/create-family-usecase.ts`、`docs/04_application/family/create-family.md`

## テスト

| 状況 | 行動 |
| --- | --- |
| テストがある | 通す実装のみ。緩和・削除はしない |
| ない | Test Design に沿って usecase / infrastructure / action に追加する |
| 完了時 | Implementation Plan の検証コマンドを実行して報告する |

## 完了報告

1. Issue 番号と何をしたか
2. スコープ外
3. 触ったファイル
4. テストと結果
5. レビューで見てほしい点
6. 次の提案は 1 つ（着手しない）
7. ずれがあれば candidate まで（採否しない）

PR は明示依頼があるときだけ。次の機能へ自動では進まない。
