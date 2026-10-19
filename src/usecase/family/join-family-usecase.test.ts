import { describe, expect, it, vi } from "vitest";
import type { Family } from "@/domain/models/family/family";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    joinFamilyUsecase,
    type JoinFamilyDeps,
} from "./join-family-usecase";

const input = { userId: "user-1", inviteId: "invite-1" };

const existingFamily: Family = {
    id: "family-existing",
    name: "既存家",
    ownerId: "user-1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
};

/**
 * 承認ユースケースの依存を作る。
 * @param overrides 差し替える依存
 * @returns モック済みの依存
 */
function deps(overrides: Partial<JoinFamilyDeps> = {}): JoinFamilyDeps {
    return {
        isPermanentUser: vi.fn().mockResolvedValue(true),
        findFamilyByUserId: vi.fn().mockResolvedValue(null),
        approveFamilyInvite: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe("joinFamilyUsecase", () => {
    it("未所属の本登録ユーザーは招待を承認する", async () => {
        const inviteDeps = deps();

        await joinFamilyUsecase(input, inviteDeps);

        expect(inviteDeps.approveFamilyInvite).toHaveBeenCalledWith("invite-1");
    });

    it("既に家族がある人は別の家族を承認しない", async () => {
        const inviteDeps = deps({
            findFamilyByUserId: vi.fn().mockResolvedValue(existingFamily),
        });

        await expect(joinFamilyUsecase(input, inviteDeps)).rejects.toThrow(
            FamilyInviteErrorCode.ALREADY_IN_FAMILY,
        );
        expect(inviteDeps.approveFamilyInvite).not.toHaveBeenCalled();
    });

    it("ゲストは承認しない", async () => {
        const inviteDeps = deps({
            isPermanentUser: vi.fn().mockResolvedValue(false),
        });

        await expect(joinFamilyUsecase(input, inviteDeps)).rejects.toThrow(
            FamilyInviteErrorCode.GUEST_NOT_ALLOWED,
        );
        expect(inviteDeps.approveFamilyInvite).not.toHaveBeenCalled();
    });

    it.each([
        FamilyInviteErrorCode.INVITE_EXPIRED,
        FamilyInviteErrorCode.INVITE_REVOKED,
        FamilyInviteErrorCode.INVITE_ALREADY_USED,
        FamilyInviteErrorCode.INVITE_NOT_USABLE,
        FamilyInviteErrorCode.FAMILY_MEMBER_LIMIT,
        FamilyInviteErrorCode.EMAIL_NOT_CONFIRMED,
    ])("%s のときは所属を増やさない", async (code) => {
        const inviteDeps = deps({
            approveFamilyInvite: vi.fn().mockRejectedValue(new Error(code)),
        });

        await expect(joinFamilyUsecase(input, inviteDeps)).rejects.toThrow(code);
    });
});
