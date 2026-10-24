import { expect, test, type Page } from "@playwright/test";
import {
    deleteFamilyInviteUsers,
    seedFamilyInviteUsers,
    type SeededFamilyUser,
} from "./helpers/family-invite-users";
import { hasE2ETestCredentials } from "./helpers/login";

/**
 * メールとパスワードでログインし、/top に着く。
 * @param page ブラウザ
 * @param user ログインする人
 */
async function login(page: Page, user: SeededFamilyUser): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(user.email);
    await page.getByLabel("パスワード").fill(user.password);
    await page.getByRole("button", { name: "ログイン", exact: true }).click();
    await expect(page).toHaveURL(/\/(top|profile\/new)$/, { timeout: 15_000 });
}

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

    test("ゲストには発行フォームも参加ボタンも出ない", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: "ゲストで試す" }).click();
        await expect(page).toHaveURL(/\/(top|profile\/new)$/, {
            timeout: 15_000,
        });

        await page.goto("/family");
        await expect(
            page.getByRole("button", { name: "招待する" }),
        ).toHaveCount(0);
        await expect(page.getByLabel("宛先のメールアドレス")).toHaveCount(0);

        await page.goto("/family/join");
        await expect(
            page.getByRole("button", { name: "この家族に参加する" }),
        ).toHaveCount(0);
        await expect(page.getByRole("link", { name: "本登録へ" })).toBeVisible();
    });
});

test.describe("家族への招待の発行と参加", () => {
    test.describe.configure({ mode: "serial" });

    let owner: SeededFamilyUser;
    let invitee: SeededFamilyUser;

    test.beforeAll(async () => {
        const seeded = await seedFamilyInviteUsers();
        owner = seeded.owner;
        invitee = seeded.invitee;
    });

    test.afterAll(async () => {
        if (owner && invitee) {
            await deleteFamilyInviteUsers([owner, invitee]);
        }
    });

    test("オーナーは招待を発行し、案内 URL を見られる", async ({ page }) => {
        await login(page, owner);
        await page.goto("/family");
        await page.getByLabel("家族名").fill("招待テスト家");
        await page.getByRole("button", { name: "家族グループを作成する" }).click();
        await expect(page).toHaveURL(/\/(top|profile\/new)/, { timeout: 15_000 });

        await page.goto("/family");
        await page.getByLabel("宛先のメールアドレス").fill(invitee.email);
        await page.getByRole("button", { name: "招待する" }).click();

        await expect(page.getByText("案内の URL は /family です")).toBeVisible();
        await expect(page.getByText(invitee.email)).toBeVisible();
    });

    test("宛先本人は承認して家族のメンバーになる", async ({ page }) => {
        await login(page, invitee);
        await page.goto("/family");
        await expect(page.getByText("招待テスト家")).toBeVisible();
        await page.getByRole("link", { name: "承認画面へ" }).click();
        await page.getByRole("button", { name: "この家族に参加する" }).click();

        await expect(page).toHaveURL(/\/family$/, { timeout: 15_000 });
        await expect(page.getByText("招待テスト家")).toBeVisible();
        await expect(page.getByText("あなたの家族グループです")).toBeVisible();
    });
});
