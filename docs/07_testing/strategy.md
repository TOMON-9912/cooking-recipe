# テスト戦略

## 単体・結合（Vitest）

- 配置: `src/**/*.test.ts`
- 実行: `npm run test:run`
- usecase / app Action は deps モックで層を分離してテスト

## E2E（Playwright）

- 配置: `e2e/`
- 実行: `npm run test:e2e`
- 詳細: [e2e-playwright.md](./e2e-playwright.md)

## CI

`main` / `develop` への push と PR で lint + Vitest。E2E は認証情報未設定時スキップするケースあり。

## スコープ

[test-scope.md](./test-scope.md) と [application/source-index/](../04_application/source-index/README.md) を参照してください。
