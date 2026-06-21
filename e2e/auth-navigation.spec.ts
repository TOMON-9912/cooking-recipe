import { expect, test } from "@playwright/test";

test.describe("認証画面の導線", () => {
  test("ログイン画面が表示され、入力欄が揃っている", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();

    const email = page.getByLabel("メールアドレス");
    const password = page.getByLabel("パスワード");
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();

    // 必須入力であること（未入力では送信できない）
    await expect(email).toHaveAttribute("required", "");
    await expect(password).toHaveAttribute("required", "");

    await expect(
      page.getByRole("button", { name: "ログイン" }),
    ).toBeVisible();
  });

  test("ログイン画面から新規登録画面へ移動できる", async ({ page }) => {
    await page.goto("/login");

    // ヘッダーにも同名リンクがあるため、本文（main）内のリンクを使う
    await page.getByRole("main").getByRole("link", { name: "新規登録" }).click();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole("heading", { name: "アカウント作成" }),
    ).toBeVisible();
  });

  test("新規登録画面からログイン画面へ戻れる", async ({ page }) => {
    await page.goto("/signup");

    await page.getByRole("main").getByRole("link", { name: "ログイン" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });
});
