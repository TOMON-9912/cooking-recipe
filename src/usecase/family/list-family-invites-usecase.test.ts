import { describe, expect, it, vi } from "vitest";
import type { FamilyInviteRecord } from "@/domain/models/family/family-invite";
import { FamilyInviteErrorCode } from "./family-invite-errors";
import {
    listFamilyInvitesUsecase,
    type ListFamilyInvitesDeps,
} from "./list-family-invites-usecase";

const now = new Date("2026-10-19T12:00:00Z");
const familyId = "family-1";

/**
 * 一覧用の招待行を作る。
 * @param overrides 上書きする列
 * @returns 招待行
 */
function record(
    overrides: Partial<FamilyInviteRecord> = {},
): FamilyInviteRecord {
    return {
        id: "invite-1",
        invitedEmail: "a@example.com",
        expiresAt: new Date("2026-10-20T12:00:00Z"),
        revokedAt: null,
        usedAt: null,
        ...overrides,
    };
}

/**
 * 一覧ユースケースの依存を作る。
 * @param records リポジトリが返す行
 * @param overrides 差し替える依存
 * @returns モック済みの依存
 */
function deps(
    records: FamilyInviteRecord[],
    overrides: Partial<ListFamilyInvitesDeps> = {},
): ListFamilyInvitesDeps {
    return {
        isPermanentUser: vi.fn().mockResolvedValue(true),
        isOwnerOfFamily: vi.fn().mockResolvedValue(true),
        listFamilyInvites: vi.fn().mockResolvedValue(records),
        now: () => now,
        ...overrides,
    };
}

describe("listFamilyInvitesUsecase", () => {
    it("期限内で未使用の招待だけ、宛先と期限を返す", async () => {
        const invites = await listFamilyInvitesUsecase(
            familyId,
            deps([
                record(),
                record({
                    id: "revoked",
                    revokedAt: new Date("2026-10-19T01:00:00Z"),
                }),
                record({
                    id: "used",
                    usedAt: new Date("2026-10-19T01:00:00Z"),
                }),
                record({
                    id: "expired",
                    expiresAt: new Date("2026-10-19T11:00:00Z"),
                }),
                record({
                    id: "boundary",
                    expiresAt: now,
                }),
            ]),
        );

        expect(invites).toEqual([
            {
                id: "invite-1",
                invitedEmail: "a@example.com",
                expiresAt: new Date("2026-10-20T12:00:00Z"),
            },
        ]);
    });

    it("オーナーでない人は一覧を読まない", async () => {
        const inviteDeps = deps([record()], {
            isOwnerOfFamily: vi.fn().mockResolvedValue(false),
        });

        await expect(
            listFamilyInvitesUsecase(familyId, inviteDeps),
        ).rejects.toThrow(FamilyInviteErrorCode.NOT_OWNER);
        expect(inviteDeps.listFamilyInvites).not.toHaveBeenCalled();
    });

    it("ゲストには一覧を出さない", async () => {
        const inviteDeps = deps([record()], {
            isPermanentUser: vi.fn().mockResolvedValue(false),
        });

        await expect(
            listFamilyInvitesUsecase(familyId, inviteDeps),
        ).rejects.toThrow(FamilyInviteErrorCode.GUEST_NOT_ALLOWED);
        expect(inviteDeps.listFamilyInvites).not.toHaveBeenCalled();
    });
});
