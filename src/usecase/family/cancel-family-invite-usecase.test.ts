import { describe, expect, it, vi } from "vitest";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    cancelFamilyInviteUsecase,
    type CancelFamilyInviteDeps,
} from "./cancel-family-invite-usecase";

const input = { familyId: "family-1", inviteId: "invite-1" };

/**
 * 取り消しユースケースの依存を作る。
 * @param overrides 差し替える依存
 * @returns モック済みの依存
 */
function deps(
    overrides: Partial<CancelFamilyInviteDeps> = {},
): CancelFamilyInviteDeps {
    return {
        isPermanentUser: vi.fn().mockResolvedValue(true),
        isOwnerOfFamily: vi.fn().mockResolvedValue(true),
        cancelFamilyInvite: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe("cancelFamilyInviteUsecase", () => {
    it("オーナーは未使用の招待を取り消す", async () => {
        const inviteDeps = deps();

        await cancelFamilyInviteUsecase(input, inviteDeps);

        expect(inviteDeps.cancelFamilyInvite).toHaveBeenCalledWith("invite-1");
    });

    it("使用済みの招待は取り消さず、所属は変えない", async () => {
        const inviteDeps = deps({
            cancelFamilyInvite: vi
                .fn()
                .mockRejectedValue(
                    new Error(FamilyInviteErrorCode.INVITE_ALREADY_USED),
                ),
        });

        await expect(
            cancelFamilyInviteUsecase(input, inviteDeps),
        ).rejects.toThrow(FamilyInviteErrorCode.INVITE_ALREADY_USED);
    });

    it("オーナーでない人は取り消さない", async () => {
        const inviteDeps = deps({
            isOwnerOfFamily: vi.fn().mockResolvedValue(false),
        });

        await expect(
            cancelFamilyInviteUsecase(input, inviteDeps),
        ).rejects.toThrow(FamilyInviteErrorCode.NOT_OWNER);
        expect(inviteDeps.cancelFamilyInvite).not.toHaveBeenCalled();
    });

    it("ゲストは取り消さない", async () => {
        const inviteDeps = deps({
            isPermanentUser: vi.fn().mockResolvedValue(false),
        });

        await expect(
            cancelFamilyInviteUsecase(input, inviteDeps),
        ).rejects.toThrow(FamilyInviteErrorCode.GUEST_NOT_ALLOWED);
        expect(inviteDeps.cancelFamilyInvite).not.toHaveBeenCalled();
    });
});
