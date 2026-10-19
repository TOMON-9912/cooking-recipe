---
name: write-test-design
description: Writes the three test-phase artifacts (Vitest with mocks, Vitest against a real database, and e2e) for a slice whose requirements and design are confirmed. Does not write test-design markdown. Use when filling tests, or running /test-design.
---

# テストを書く

仕様・設計は書かない（`/design`）。操作ごとのテスト設計 Markdown は書かない。成果物は次の 3 つだけ（[ADR 014](../../docs/04_decisions/014-narrow-design-and-test-artifacts.md)）。

| 種類 | 見ること | 置き場 | 実行 |
| --- | --- | --- | --- |
| Vitest（モックあり） | usecase / action。deps はモック | `src/**/*.test.ts` | `npm run test:run` |
| Vitest（実 DB） | RLS、RPC、書き込み後の読み戻し、同時実行 | `src/**/*.db.test.ts` | `npm run test:db` |
| e2e | 画面をまたぐクリティカルパス | `e2e/**/*.spec.ts` | `npm run test:e2e` |

その操作に無い種類は書かない。モックが通ったことを、RLS の検証にしない。

実装がまだ無い操作のテストは、このフェーズでは失敗してよい。実装フェーズで通す。

このスキルは、テスト Issue を作り、そのブランチでテストを書く（`docs/05_development/issue-workflow.md`）。次のプロセス（実装）の Issue は作らない。

## 始める前

1. 要件定義（`docs/01_requirements/{機能}.md`）がある
2. 設計として、必要な Architecture / database / ADR がある
3. 要件定義 Issue と設計 Issue が閉じている（PR がマージ済み）、またはユーザーがこのチャットで確定を明示している

足りないときは書かずに止まり、`/requirements` または `/design` へ戻す。

## 始め方

`docs/05_development/issue-workflow.md` の「各プロセスの始め方」に従う。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 設計 Issue が閉じていることを確かめる。開いていれば止まって聞く
3. 親の子 Issue を確かめ、テスト Issue が無ければ作る。タイトルは `test: {機能}のテスト`。成果物は 3 種のテスト
4. `git switch -c docs/{Issue}-test-design-{slug} origin/develop` で作業ブランチを切る。push しない

## 書き方

- 要件の ID と、database / ADR の失敗・権限・状態から、正常系・異常系・境界を選ぶ
- 受け入れ条件の全文コピーは、テスト名の代わりにしない
- 要件・設計に無いことを足さない

## 完了

書いたパス、実行したコマンドと結果、作った Issue とブランチを列挙する。次は人間によるレビューと PR（依頼があるときだけ。本文に `Closes #{テスト Issue}`）。実装へ進まない。Ready は付けない。
