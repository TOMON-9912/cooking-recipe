import { expect, test } from "@playwright/test";
import { hasE2ETestCredentials, loginAsTestUser } from "./helpers/login";

/** 存在しないレシピ ID。編集画面が 404 になることの確認に使う */
const UNKNOWN_RECIPE_ID = "00000000-0000-4000-8000-000000000000";

test.describe("レシピ編集（未ログイン）", () => {
    test("編集画面は /login へリダイレクトされる", async ({ page }) => {
        const path = `/recipe/${UNKNOWN_RECIPE_ID}/edit`;

        await page.goto(path);

        await expect(page).toHaveURL(
            new RegExp(`/login\\?redirectTo=${encodeURIComponent(path)}`),
        );
    });
});

test.describe("レシピ編集（ログイン後）", () => {
    test.beforeEach(async ({ page }) => {
        test.skip(
            !hasE2ETestCredentials(),
            "E2E_TEST_EMAIL / E2E_TEST_PASSWORD が未設定",
        );
        await loginAsTestUser(page);
    });

    test("開けないレシピの編集画面は 404 になる", async ({ page }) => {
        const response = await page.goto(
            `/recipe/${UNKNOWN_RECIPE_ID}/edit`,
        );

        expect(response?.status()).toBe(404);
    });

    test("詳細から編集して料理名を保存できる", async ({ page }) => {
        await page.goto("/top");

        const recipeLink = page
            .locator(
                'main a[href^="/recipe/"]:not([href="/recipe/new"]):not([href="/recipe/search"])',
            )
            .first();
        test.skip((await recipeLink.count()) === 0, "レシピが 1 件もない");
        await recipeLink.click();

        const editLink = page.getByRole("link", { name: "レシピを編集" });
        test.skip(
            (await editLink.count()) === 0,
            "テストユーザーが作者のレシピがない",
        );
        await editLink.click();

        await expect(page).toHaveURL(/\/recipe\/[^/]+\/edit$/);

        const titleInput = page.getByLabel("料理名");
        const originalTitle = await titleInput.inputValue();
        expect(originalTitle).not.toBe("");

        const editedTitle = `${originalTitle} (E2E)`;
        await titleInput.fill(editedTitle);
        await page.getByRole("button", { name: "変更を保存" }).click();

        await expect(page).toHaveURL(/\/recipe\/[^/]+$/);
        await expect(
            page.getByRole("heading", { level: 1, name: editedTitle }),
        ).toBeVisible();

        // 他のテストに影響しないよう元の料理名へ戻す
        await page.getByRole("link", { name: "レシピを編集" }).click();
        await page.getByLabel("料理名").fill(originalTitle);
        await page.getByRole("button", { name: "変更を保存" }).click();

        await expect(
            page.getByRole("heading", { level: 1, name: originalTitle }),
        ).toBeVisible();
    });
});
