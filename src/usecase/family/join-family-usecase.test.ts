import { describe, expect, it, vi } from "vitest";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    joinFamilyUsecase,
    type JoinFamilyDeps,
} from "./join-family-usecase";

const input = { inviteId: "invite-1" };

/**
 * 承認ユースケースの依存を作る。
 * @param overrides 差し替える依存
 * @returns モック済みの依存
 */
function deps(overrides: Partial<JoinFamilyDeps> = {}): JoinFamilyDeps {
    return {
        isPermanentUser: vi.fn().mockResolvedValue(true),
        approveFamilyInvite: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe("joinFamilyUsecase", () => {
    it("本登録ユーザーは承認を DB 関数に渡す", async () => {
        const inviteDeps = deps();

        await joinFamilyUsecase(input, inviteDeps);

        expect(inviteDeps.approveFamilyInvite).toHaveBeenCalledWith("invite-1");
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
});
