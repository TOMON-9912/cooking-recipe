import { defineConfig, devices } from "@playwright/test";

/**
 * E2E テストの設定。
 * - テストは `e2e/` 配下に置く（Vitest は `src/**\/*.test.ts` のみ対象なので競合しない）
 * - webServer で `npm run dev` を起動し、baseURL に対してテストする
 *
 * baseURL は E2E_BASE_URL で上書きできる（既に起動済みのサーバーに当てたい場合など）。
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // 外部サーバーを使う場合（E2E_BASE_URL 指定時）は webServer を起動しない
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
