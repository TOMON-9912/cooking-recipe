// npm run test:run -- src/app/family/new/create-family.action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { createFamilyAction } from "./create-family.action";
import { createAuthedClient } from "@/lib/supabase/server";
import { createFamilyUsecase } from "@/usecase/family/create-family-usecase";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { FAMILY_CREATED_REDIRECT_PATH } from "@/constants/toast-messages";

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

vi.mock("@/usecase/family/create-family-usecase", () => ({
    createFamilyUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/family/family-repository-impl", () => ({
    createFamily: vi.fn(),
    findFamilyByUserId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/family/family-member-repository-impl", () => ({
    addFamilyMember: vi.fn(),
}));

describe("createFamilyAction 関数", () => {
    const formData = new FormData();
    formData.set("name", "田中家");

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAuthedClient).mockResolvedValue({
            user: { id: "user-1" },
        } as never);
    });

    it("成功時は /top?toast=familyCreated へ redirect する", async () => {
        vi.mocked(createFamilyUsecase).mockResolvedValue({
            id: "family-1",
            name: "田中家",
            ownerId: "user-1",
            createdAt: new Date(),
        });

        await expect(createFamilyAction(null, formData)).rejects.toThrow(
            "NEXT_REDIRECT",
        );
        expect(redirect).toHaveBeenCalledWith(FAMILY_CREATED_REDIRECT_PATH);
        expect(createFamilyUsecase).toHaveBeenCalledWith(
            { name: "田中家", ownerId: "user-1" },
            expect.objectContaining({
                findFamilyByUserId: expect.any(Function),
                createFamily: expect.any(Function),
                addFamilyMember: expect.any(Function),
            }),
        );
    });

    it("FAMILY_NAME_REQUIRED はユーザー向けメッセージを返す", async () => {
        vi.mocked(createFamilyUsecase).mockRejectedValue(
            new Error("FAMILY_NAME_REQUIRED"),
        );

        const result = await createFamilyAction(null, formData);

        expect(result).toEqual({
            success: false,
            error: ERROR_MESSAGES.FAMILY_NAME_REQUIRED,
        });
    });

    it("ALREADY_IN_FAMILY はユーザー向けメッセージを返す", async () => {
        vi.mocked(createFamilyUsecase).mockRejectedValue(
            new Error("ALREADY_IN_FAMILY"),
        );

        const result = await createFamilyAction(null, formData);

        expect(result).toEqual({
            success: false,
            error: ERROR_MESSAGES.ALREADY_IN_FAMILY,
        });
    });

    it("Error 以外の throw は汎用メッセージ", async () => {
        vi.mocked(createFamilyUsecase).mockRejectedValue("unexpected");

        const result = await createFamilyAction(null, formData);

        expect(result).toEqual({
            success: false,
            error: ERROR_MESSAGES.FAMILY_CREATE_FAILED,
        });
    });
});
