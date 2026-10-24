import { describe, expect, it, vi } from "vitest";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    listMyFamilyInvitesUsecase,
    type ListMyFamilyInvitesDeps,
} from "./list-my-family-invites-usecase";

describe("listMyFamilyInvitesUsecase", () => {
    it("自分宛ての招待は家族名と期限だけ返す", async () => {
        const deps: ListMyFamilyInvitesDeps = {
            isPermanentUser: vi.fn().mockResolvedValue(true),
            listMyFamilyInvites: vi.fn().mockResolvedValue([
                {
                    id: "invite-1",
                    familyName: "田中家",
                    expiresAt: new Date("2026-10-20T00:00:00Z"),
                    ownerName: "田中",
                    members: ["田中"],
                },
            ]),
        };

        const invites = await listMyFamilyInvitesUsecase(deps);

        expect(invites).toEqual([
            {
                id: "invite-1",
                familyName: "田中家",
                expiresAt: new Date("2026-10-20T00:00:00Z"),
            },
        ]);
        expect(invites[0]).not.toHaveProperty("ownerName");
        expect(invites[0]).not.toHaveProperty("members");
    });

    it("ゲストには自分宛ての招待を出さない", async () => {
        const deps: ListMyFamilyInvitesDeps = {
            isPermanentUser: vi.fn().mockResolvedValue(false),
            listMyFamilyInvites: vi.fn(),
        };

        await expect(listMyFamilyInvitesUsecase(deps)).rejects.toThrow(
            FamilyInviteErrorCode.GUEST_NOT_ALLOWED,
        );
        expect(deps.listMyFamilyInvites).not.toHaveBeenCalled();
    });
});
