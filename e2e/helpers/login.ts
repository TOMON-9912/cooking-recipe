import { expect, type Page } from "@playwright/test";

/**
 * E2E 用テストユーザー認証情報が設定されているか判定する
 * @returns 設定済みなら true
 */
export function hasE2ETestCredentials(): boolean {
    return Boolean(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD);
}

/**
 * テストユーザーでログインし、/top へ遷移する
 * @param page Playwright Page
 */
export async function loginAsTestUser(page: Page): Promise<void> {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "E2E_TEST_EMAIL / E2E_TEST_PASSWORD が未設定です。.env.local に追加してください。",
        );
    }

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン", exact: true }).click();
    await expect(page).toHaveURL(/\/top$/, { timeout: 15_000 });
}
