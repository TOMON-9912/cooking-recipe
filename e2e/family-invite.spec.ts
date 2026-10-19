import { expect, test } from "@playwright/test";
import { hasE2ETestCredentials } from "./helpers/login";

test.describe("家族への招待", () => {
    test("未ログインでは承認画面を開かず、ログインが必要と分かる", async ({
        page,
    }) => {
        await page.goto("/family/join");

        await expect(page).toHaveURL(
            /\/login\?redirectTo=%2Ffamily%2Fjoin/,
        );
        await expect(
            page.getByRole("heading", { name: "ログイン" }),
        ).toBeVisible();
        await expect(
            page.getByRole("button", { name: "この家族に参加する" }),
        ).toHaveCount(0);
    });

    test("承認画面からログインしても、承認画面へは戻らない", async ({
        page,
    }) => {
        test.skip(
            !hasE2ETestCredentials(),
            "E2E_TEST_EMAIL / E2E_TEST_PASSWORD が未設定",
        );

        await page.goto("/family/join");
        await page
            .getByLabel("メールアドレス")
            .fill(process.env.E2E_TEST_EMAIL ?? "");
        await page
            .getByLabel("パスワード")
            .fill(process.env.E2E_TEST_PASSWORD ?? "");
        await page
            .getByRole("button", { name: "ログイン", exact: true })
            .click();

        await expect(page).toHaveURL(/\/top$/, { timeout: 15_000 });
        await expect(page).not.toHaveURL(/\/family\/join/);
    });
});
