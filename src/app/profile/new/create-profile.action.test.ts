// npm run test:run -- src/app/profile/new/create-profile.action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { createProfileAction } from "./create-profile.action";
import { createAuthedClient } from "@/lib/supabase/server";
import { createProfileUsecase } from "@/usecase/profile/create-profile-usecase";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { PROFILE_CREATED_REDIRECT_PATH } from "@/constants/toast-messages";

vi.mock("next/navigation", () => ({
    redirect: vi.fn((path: string) => {
        const err = new Error("NEXT_REDIRECT") as Error & { digest: string };
        err.digest = `NEXT_REDIRECT;replace;${path};307;`;
        throw err;
    }),
}));

vi.mock("@/lib/supabase/server", () => ({
    createAuthedClient: vi.fn(),
}));

vi.mock("@/usecase/profile/create-profile-usecase", () => ({
    createProfileUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/profile/profile-repository-impl", () => ({
    createProfile: vi.fn(),
    findProfileByUserId: vi.fn(),
}));

describe("createProfileAction 関数", () => {
    const formData = new FormData();
    formData.set("displayName", "たろう");
    formData.set("avatarIcon", "user");

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAuthedClient).mockResolvedValue({
            user: { id: "user-1" },
        } as never);
    });

    it("成功時は /top?toast=profileCreated へ redirect する", async () => {
        vi.mocked(createProfileUsecase).mockResolvedValue({
            userId: "user-1",
            displayName: "たろう",
            avatarIcon: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await expect(createProfileAction(null, formData)).rejects.toThrow(
            "NEXT_REDIRECT",
        );
        expect(redirect).toHaveBeenCalledWith(PROFILE_CREATED_REDIRECT_PATH);
        expect(createProfileUsecase).toHaveBeenCalledWith(
            { userId: "user-1", displayName: "たろう", avatarIcon: "user" },
            expect.objectContaining({
                findProfileByUserId: expect.any(Function),
                createProfile: expect.any(Function),
            }),
        );
    });

    it("不正なアイコンならエラーを返す", async () => {
        const invalidFormData = new FormData();
        invalidFormData.set("displayName", "たろう");
        invalidFormData.set("avatarIcon", "invalid");

        const result = await createProfileAction(null, invalidFormData);

        expect(result).toEqual({
            success: false,
            error: ERROR_MESSAGES.INVALID_AVATAR_ICON,
        });
        expect(createProfileUsecase).not.toHaveBeenCalled();
    });

    it("usecase が失敗したらエラーメッセージを返す", async () => {
        vi.mocked(createProfileUsecase).mockRejectedValue(
            new Error("PROFILE_ALREADY_EXISTS"),
        );

        const result = await createProfileAction(null, formData);

        expect(result).toEqual({
            success: false,
            error: ERROR_MESSAGES.PROFILE_ALREADY_EXISTS,
        });
    });
});
