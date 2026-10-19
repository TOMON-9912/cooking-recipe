import { describe, expect, it, vi } from "vitest";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    createFamilyInviteUsecase,
    type CreateFamilyInviteDeps,
} from "./create-family-invite-usecase";

const familyId = "family-1";

/**
 * 発行ユースケースの依存を、成功するモックで作る。
 * @param overrides 差し替える依存
 * @returns モック済みの依存
 */
function deps(
    overrides: Partial<CreateFamilyInviteDeps> = {},
): CreateFamilyInviteDeps {
    return {
        isPermanentUser: vi.fn().mockResolvedValue(true),
        isOwnerOfFamily: vi.fn().mockResolvedValue(true),
        createFamilyInvite: vi.fn().mockResolvedValue({
            id: "invite-1",
            invitedEmail: "guest@example.com",
            expiresAt: new Date("2026-10-20T00:00:00Z"),
        }),
        ...overrides,
    };
}

describe("createFamilyInviteUsecase", () => {
    it("宛先を小文字にして 1 件発行する", async () => {
        const inviteDeps = deps();

        const invite = await createFamilyInviteUsecase(
            { familyId, invitedEmail: "  Guest@Example.com " },
            inviteDeps,
        );

        expect(inviteDeps.createFamilyInvite).toHaveBeenCalledWith({
            familyId,
            invitedEmail: "guest@example.com",
        });
        expect(invite.id).toBe("invite-1");
    });

    it("別の宛先なら続けて発行できる", async () => {
        const inviteDeps = deps();

        await createFamilyInviteUsecase(
            { familyId, invitedEmail: "a@example.com" },
            inviteDeps,
        );
        await createFamilyInviteUsecase(
            { familyId, invitedEmail: "b@example.com" },
            inviteDeps,
        );

        expect(inviteDeps.createFamilyInvite).toHaveBeenCalledTimes(2);
    });

    it("オーナーでない本登録ユーザーは発行しない", async () => {
        const inviteDeps = deps({
            isOwnerOfFamily: vi.fn().mockResolvedValue(false),
        });

        await expect(
            createFamilyInviteUsecase(
                { familyId, invitedEmail: "a@example.com" },
                inviteDeps,
            ),
        ).rejects.toThrow(FamilyInviteErrorCode.NOT_OWNER);
        expect(inviteDeps.createFamilyInvite).not.toHaveBeenCalled();
    });

    it("ゲストは発行しない", async () => {
        const inviteDeps = deps({
            isPermanentUser: vi.fn().mockResolvedValue(false),
        });

        await expect(
            createFamilyInviteUsecase(
                { familyId, invitedEmail: "a@example.com" },
                inviteDeps,
            ),
        ).rejects.toThrow(FamilyInviteErrorCode.GUEST_NOT_ALLOWED);
        expect(inviteDeps.createFamilyInvite).not.toHaveBeenCalled();
    });

    it("メール形式が違うときは発行しない", async () => {
        const inviteDeps = deps();

        await expect(
            createFamilyInviteUsecase(
                { familyId, invitedEmail: "not-an-email" },
                inviteDeps,
            ),
        ).rejects.toThrow(FamilyInviteErrorCode.INVALID_EMAIL);
        expect(inviteDeps.createFamilyInvite).not.toHaveBeenCalled();
    });
});
