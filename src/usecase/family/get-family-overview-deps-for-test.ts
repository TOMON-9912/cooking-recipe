import { vi } from "vitest";
import type { Family } from "@/domain/models/family/family";
import type { FamilyMember } from "@/domain/models/family/family-member";
import type { GetFamilyOverviewDeps } from "./get-family-overview-usecase";

/**
 * テスト用の GetFamilyOverviewDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの GetFamilyOverviewDeps
 */
export function getFamilyOverviewDepsForTest(
    overrides: Partial<GetFamilyOverviewDeps> = {},
): GetFamilyOverviewDeps {
    const mockFamily: Family = {
        id: "family-1",
        name: "田中家",
        ownerId: "user-1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    const mockMembers: FamilyMember[] = [
        {
            familyId: "family-1",
            userId: "user-1",
            joinedAt: new Date("2024-01-01T00:00:00Z"),
        },
    ];

    return {
        findFamilyByUserId: vi.fn().mockResolvedValue(mockFamily),
        findFamilyMembersByFamilyId: vi.fn().mockResolvedValue(mockMembers),
        ...overrides,
    };
}
