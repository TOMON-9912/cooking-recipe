# テスト戦略

テストフェーズの成果物は次の 3 つ（[ADR 014](../04_decisions/014-narrow-design-and-test-artifacts.md)）。操作ごとのテスト設計 Markdown は、新規では書かない。

| 種類 | 見ること | 置き場 |
| --- | --- | --- |
| Vitest（モックあり） | usecase / action。deps はモック | `src/**/*.test.ts` |
| Vitest（実 DB） | RLS、RPC、書き込み後の読み戻し、同時実行。実行は `npm run test:db` | `src/**/*.db.test.ts` |
| e2e | 画面をまたぐクリティカルパス | `e2e/**/*.spec.ts` |

モックの Vitest が通っても、RLS を検証したことにはしない。

## Vitest（モックあり）

- 実行: `npm run test:run`
- usecase / app Action は deps モックで層を分離してテスト

## E2E（Playwright）

- 配置: `e2e/`
- 実行: `npm run test:e2e`
- 詳細: [e2e-playwright.md](./e2e-playwright.md)

## CI

`main` / `develop` への push と PR で lint + Vitest。E2E は認証情報未設定時スキップするケースあり。

## スコープ

[test-scope.md](./test-scope.md) と [application/source-index/](../02_design/application/source-index/README.md) を参照してください。
