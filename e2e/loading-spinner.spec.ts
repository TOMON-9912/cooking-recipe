import { expect, test } from "@playwright/test";
import { hasE2ETestCredentials } from "./helpers/login";

const NAVIGATION_DELAY_MS = 1200;

/**
 * 先読みが終わっていると、クリック時に待ち時間が出ない。
 * 遷移先の先読みは捨て、クリック後の取得だけ遅らせる。
 * @param url リクエスト URL
 * @param headers リクエストヘッダ（小文字）
 * @returns 先読みの RSC なら true
 */
function isPrefetchRsc(
    url: string,
    headers: Record<string, string>,
): boolean {
    const isRsc = headers["rsc"] === "1" || url.includes("_rsc=");
    const isPrefetch =
        headers["next-router-prefetch"] === "1" ||
        headers["purpose"] === "prefetch";
    return isRsc && isPrefetch;
}

/**
 * クリックによるページ取得の RSC か。
 * @param url リクエスト URL
 * @param headers リクエストヘッダ（小文字）
 * @returns 先読みではない RSC なら true
 */
function isNavigationRsc(
    url: string,
    headers: Record<string, string>,
): boolean {
    const isRsc = headers["rsc"] === "1" || url.includes("_rsc=");
    return isRsc && !isPrefetchRsc(url, headers);
}

test.describe("ローディングスピナー", () => {
    test("ページを開くまでの待ち時間にスピナーが出て、開いたら消える", async ({
        page,
    }) => {
        await page.route("**/*", async (route) => {
            const request = route.request();
            const headers = request.headers();
            const url = request.url();
            const isSignup = url.includes("/signup");

            if (isSignup && isPrefetchRsc(url, headers)) {
                await route.abort();
                return;
            }

            if (isSignup && isNavigationRsc(url, headers)) {
                await new Promise((resolve) =>
                    setTimeout(resolve, NAVIGATION_DELAY_MS),
                );
            }

            await route.continue();
        });

        await page.goto("/login");
        await expect(
            page.getByRole("heading", { name: "ログイン" }),
        ).toBeVisible();

        await page
            .locator("header")
            .getByRole("link", { name: "新規登録" })
            .click();

        const spinner = page.getByRole("status", { name: "読み込み中" });
        await expect(spinner).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "アカウント作成" }),
        ).toBeVisible();
        await expect(spinner).toHaveCount(0);
    });

    test("ボタンを押したあとの処理中にスピナーが出て、終わると消える", async ({
        page,
    }) => {
        await page.goto("/login");

        let releaseAction = () => {};
        const actionHeld = new Promise<void>((resolve) => {
            releaseAction = resolve;
        });

        await page.route("**/*", async (route) => {
            const request = route.request();
            if (
                request.method() === "POST" &&
                request.headers()["next-action"]
            ) {
                await actionHeld;
            }
            await route.continue();
        });

        await page.getByLabel("メールアドレス").fill("not-a-user@example.com");
        await page.getByLabel("パスワード").fill("wrong-password-1");

        const spinner = page.getByRole("status", { name: "読み込み中" });
        const click = page.getByRole("button", { name: "ログイン" }).click();
        await expect(spinner).toBeVisible();
        releaseAction();
        await click;
        await expect(spinner).toHaveCount(0);
        await expect(
            page.getByText("メールアドレスまたはパスワードが正しくありません"),
        ).toBeVisible();
    });

    test("ログイン画面へリンクで移ったあと、ログインしてもスピナーが残らない", async ({
        page,
    }) => {
        test.skip(
            !hasE2ETestCredentials(),
            "E2E_TEST_EMAIL / E2E_TEST_PASSWORD が未設定",
        );

        const email = process.env.E2E_TEST_EMAIL ?? "";
        const password = process.env.E2E_TEST_PASSWORD ?? "";

        await page.goto("/");
        await page.locator("header").getByRole("link", { name: "ログイン" }).click();
        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole("status", { name: "読み込み中" })).toHaveCount(0);

        await page.getByLabel("メールアドレス").fill(email);
        await page.getByLabel("パスワード").fill(password);
        await page.getByRole("button", { name: "ログイン", exact: true }).click();

        await expect(page).not.toHaveURL(/\/login$/);
        await expect(page.getByRole("status", { name: "読み込み中" })).toHaveCount(0);
    });
});
