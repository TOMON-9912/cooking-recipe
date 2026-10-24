---
name: implement-feature
description: Implements one Ready GitHub Issue end-to-end under Clean Architecture. Use when the user has declared Ready and runs /implement.
---

# 機能実装（Ready 済み Issue）

**1 操作 = 1 スライス = 1 PR**。設計は書かない。完成コードはファイルに書く。

常時制約: `clean-architecture.mdc` / `file-naming.mdc` / `code-style.mdc` / `ui-design.mdc` / `git-workflow.mdc` / `harness-governance.mdc`

## 実装してよいか

次が揃うまで **1 行も実装しない**。足りないものは `/plan` または `/design` へ戻す。

1. 実装 Issue（番号または URL）がある。親 Issue、要件定義 Issue、設計 Issue は対象にしない。無いときは、下の「実装 Issue がまだ無いとき」へ
2. 実装 Issue の実装開始条件が付いている: 要件定義の確定 / 必要な設計（Architecture、database、ADR）/ 実装計画 / 設計のレビュー
3. **このチャットで** ユーザーが、仕様書・設計書レビュー後の承認を明示している（「レビューを承認した。/implement」など）
4. Implementation Plan と、要件定義および変更種別に対する正本がある
5. 未確定の判断が無い

AI が「まあ実装できる」と判断して進まない。Issue の「仕様・設計のレビュー」と「レビュー後の承認」を AI が付けない。

要件定義や、必要な database 設計が無いからスコープを短く宣言して着手する、ことはしない。

未 Ready の停止例:

```text
DB 変更が必要なのに docs/02_design/database に該当設計がありません。
実装を開始しません。/design で DB 設計を確定してください。
```

## 実装 Issue がまだ無いとき

要件定義と設計の Issue が閉じている（PR がマージ済み）ことを確かめてから、実装 Issue を作る。テストだけの Issue は待たない。開いていれば止まって聞く。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 操作の分け方は、要件定義の「進め方」と `docs/02_design/application` の操作の一覧に従う。決まっていない、または複数の案があるときは、案を示して AskQuestion で聞いて止まる
3. 親の子 Issue を確かめ（`gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues' --jq '.[] | "\(.number) \(.state) \(.title)"'`）、同じ操作の実装 Issue が無ければ、操作ごとに 1 つずつ作る（`gh issue create --parent {親} --title "feat: …" --body-file {ファイル}`）。本文は `docs/05_development/issue-workflow.md` の「実装 Issue」の骨格。完了条件は要件定義の受け入れ条件のうちその操作の分、実装計画（スライス / 触る層 / 主なパス / 検証コマンド）はここで書く。実装開始条件はすべて未チェックのまま
4. 作った Issue の番号と URL を示して**止まる**。ここでは実装もブランチ作成もしない。人間がレビューして Ready を付け、承認を明示するのを待つ

## ブランチ

実装開始条件が揃い、承認が明示されたら、その実装 Issue のブランチを切る: `git switch -c {種別}/{Issue}-{slug} origin/develop`（`feature/` `fix/` など。push しない）。同時に 1 つの実装 Issue だけ進める。

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

参考: `src/usecase/recipe/`、`src/usecase/family/create-family-usecase.ts`、`docs/02_design/application/family/create-family.md`

## テスト

このフェーズで、コードと一緒に書く。テストだけの先行フェーズは無い。

| 種類 | いつ書くか |
| --- | --- |
| Vitest（モック） | その usecase や action を書くのと一緒に。`src/**/*.test.ts` |
| Vitest（実 DB） | RLS、RPC、書き込み後の読み戻し、同時実行がこの操作にあるとき。`src/**/*.db.test.ts`。`npm run test:db` |
| e2e | 画面をまたぐクリティカルパスがこの操作にあるとき。`e2e/**/*.spec.ts` |

その操作に無い種類は書かない。モックが通ったことを、RLS の検証にしない。あるテストは緩和も削除もしない。完了時は Implementation Plan の検証コマンドを実行して報告する。

## 完了報告

1. Issue 番号と何をしたか
2. スコープ外
3. 触ったファイル
4. テストと結果
5. レビューで見てほしい点
6. 次の提案は 1 つ（着手しない）
7. ずれがあれば candidate まで（採否しない）

PR は明示依頼があるときだけ。次の機能へ自動では進まない。
