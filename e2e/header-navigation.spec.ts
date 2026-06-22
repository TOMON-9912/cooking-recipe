import { expect, test } from "@playwright/test";
import { hasE2ETestCredentials, loginAsTestUser } from "./helpers/login";

test.describe("ヘッダー導線（未ログイン）", () => {
    test("ランディングではナビゲーションリンクが表示されない", async ({
        page,
    }) => {
        await page.goto("/");

        await expect(page.locator("header nav")).toHaveCount(0);
        await expect(
            page.locator("header").getByRole("link", { name: "家族を作る" }),
        ).toHaveCount(0);
    });
});

test.describe("ヘッダー導線（ログイン後）", () => {
    test.beforeEach(async ({ page }) => {
        test.skip(
            !hasE2ETestCredentials(),
            "E2E_TEST_EMAIL / E2E_TEST_PASSWORD が未設定",
        );
        await loginAsTestUser(page);
    });

    test("「家族を作る」から家族作成画面へ遷移する", async ({ page }) => {
        await page
            .locator("header nav")
            .getByRole("link", { name: "家族を作る" })
            .click();

        await expect(page).toHaveURL(/\/family\/new$/);
        await expect(
            page.getByRole("heading", { name: "家族グループを作る" }),
        ).toBeVisible();
    });

    test("「レシピ一覧」からホームへ遷移する", async ({ page }) => {
        await page.goto("/recipe/new");

        await page
            .locator("header nav")
            .getByRole("link", { name: "レシピ一覧" })
            .click();

        await expect(page).toHaveURL(/\/top$/);
    });

    test("「レシピ登録」からレシピ登録画面へ遷移する", async ({ page }) => {
        await page
            .locator("header nav")
            .getByRole("link", { name: "レシピ登録" })
            .click();

        await expect(page).toHaveURL(/\/recipe\/new$/);
        await expect(
            page.getByRole("heading", { name: "レシピ登録" }),
        ).toBeVisible();
    });
});
