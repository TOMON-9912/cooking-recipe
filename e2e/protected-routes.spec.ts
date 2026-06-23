import { expect, test } from "@playwright/test";

/**
 * 未ログイン時のルート保護（proxy.ts のミドルウェア）を検証する。
 * 認証が必要なページは /login へリダイレクトされ、redirectTo に元のパスが付く。
 */
test.describe("ルート保護（未ログイン）", () => {
  const protectedPaths = ["/top", "/recipe/new", "/recipe/search", "/family", "/family/new"];

  for (const path of protectedPaths) {
    test(`${path} は未ログインだと /login へリダイレクトされる`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page).toHaveURL(
        new RegExp(`/login\\?redirectTo=${encodeURIComponent(path)}`),
      );
      await expect(
        page.getByRole("heading", { name: "ログイン" }),
      ).toBeVisible();
    });
  }

  test("公開ページ（/）は未ログインでも表示できる", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
