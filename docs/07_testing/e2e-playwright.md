# E2E テスト（Playwright）の使い方

ブラウザを実際に動かして画面をまたぐ挙動を検証する E2E テストの手順です。
ツール選定の経緯は [ADR 004](../adr/04-Playwright.md) を参照してください。

---

## 構成

```
cooking-recipe/
├── playwright.config.ts        # E2E 設定（dev サーバー起動・baseURL など）
└── e2e/
    ├── landing.spec.ts         # ランディングページの表示・導線
    ├── auth-navigation.spec.ts # ログイン/新規登録画面の表示・遷移
    └── protected-routes.spec.ts# 未ログイン時のルート保護（リダイレクト）
```

- 単体テスト（Vitest）は `src/**/*.test.ts`、E2E は `e2e/**/*.spec.ts` と置き場所で棲み分けています。
- そのため `npm run test:run`（Vitest）が E2E を拾うことはありません。

---

## 前提条件

| 項目 | 備考 |
|------|------|
| 依存パッケージのインストール | `npm install` 済みであること |
| ブラウザバイナリ | 初回のみ `npx playwright install chromium` が必要 |
| `.env.local` | dev サーバー起動に必要（`proxy.ts` が Supabase の環境変数を参照するため）。公開ページ・認証画面・ルート保護のテストはダミー値でも動作します |

### 初回セットアップ

```bash
# 依存をインストール（未実施の場合）
npm install

# ブラウザ（Chromium）を取得
npx playwright install chromium
```

---

## 実行方法

| コマンド | 説明 |
|----------|------|
| `npm run test:e2e` | E2E テストを一括実行（dev サーバーは自動起動・自動終了） |
| `npm run test:e2e:ui` | UI モードで起動。テストの選択・ステップ確認・タイムトラベルができる |
| `npm run test:e2e:report` | 直近の実行結果（HTML レポート）をブラウザで開く |

### よく使う実行オプション

```bash
# 特定ファイルだけ実行
npm run test:e2e -- e2e/landing.spec.ts

# テスト名で絞り込む（部分一致）
npm run test:e2e -- -g "ルート保護"

# ブラウザを表示して実行（ヘッドあり）
npm run test:e2e -- --headed

# デバッグ（ステップ実行）
npm run test:e2e -- --debug
```

### すでに dev サーバーを起動している場合

`playwright.config.ts` は `reuseExistingServer`（ローカル時）に対応しているため、
`npm run dev` を別ターミナルで起動済みでも、そのサーバーを再利用します。

別ホスト/ポートに当てたい場合は `E2E_BASE_URL` を指定します（この場合サーバーは自動起動しません）。

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## 結果の確認

- 実行後、`playwright-report/` に HTML レポートが生成されます（`npm run test:e2e:report` で表示）。
- 失敗時はスクリーンショットと、再試行時のトレースが `test-results/` に保存されます。
- これらの成果物（`playwright-report/`・`test-results/`）は `.gitignore` 済みです。

---

## テストの書き方（最小例）

```ts
import { expect, test } from "@playwright/test";

test("ログイン画面が表示される", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});
```

### 方針・コツ

- **ロケータはアクセシビリティ優先**: `getByRole` / `getByLabel` を基本にし、CSS クラス依存を避ける。
- **ヘッダーと本文の重複に注意**: 「ログイン」「新規登録」はヘッダーにも本文にも存在するため、本文を対象にしたい場合は `page.getByRole("main").getByRole("link", { name: "ログイン" })` のように領域で絞る。
- **自動待機を活かす**: `expect(locator).toBeVisible()` などは自動で待つので、固定 `waitForTimeout` は使わない。
- **baseURL を使う**: `page.goto("/login")` のように相対パスで書く（baseURL は config 側で解決）。

---

## 認証後フロー（ヘッダー導線など）

ログインが必要な E2E（`e2e/header-navigation.spec.ts` など）では、`.env.local` にテストユーザーを設定します。

```env
E2E_TEST_EMAIL=your-test-user@example.com
E2E_TEST_PASSWORD=your-password
```

- ローカル Supabase で手動登録したユーザーを使う
- 未設定の場合、ログイン後のテストは **skip** され、未ログインのテストのみ実行される
- `playwright.config.ts` 起動時に `.env.local` を読み込む

### 実行例

```bash
npm run test:e2e -- e2e/header-navigation.spec.ts
```

### 今後の拡張

- `storageState` でセッションを再利用し、各テストのログイン時間を短縮
- テストデータの投入・後始末（各テストの独立性を担保）

導入する際は本ドキュメントと ADR を更新してください。

---

## CI で実行する場合（任意）

現状の CI（`.github/workflows/ci.yml`）は Lint と単体テストのみです。E2E を追加する場合の例:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

- ブラウザ取得に時間がかかるため、`actions/cache` でのキャッシュや公式 Docker イメージの利用を検討してください。
- 認証後フローを含める場合は、テスト用の Supabase 資格情報を Secrets に登録します。

---

## 関連ドキュメント

- [ADR 004: E2E テストに Playwright を採用](../adr/04-Playwright.md)
- [GitHub Actions ワークフローの導入](./github-actions-workflow.md)
- [Playwright 公式ドキュメント](https://playwright.dev/)
