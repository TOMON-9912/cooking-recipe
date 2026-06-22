import { vi } from "vitest";
import type { Family } from "@/domain/models/family/family";
import type { CreateFamilyDeps } from "./create-family-usecase";

/**
 * テスト用の CreateFamilyDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの CreateFamilyDeps
 */
export function createFamilyDepsForTest(
    overrides: Partial<CreateFamilyDeps> = {},
): CreateFamilyDeps {
    const mockFamily: Family = {
        id: "family-1",
        name: "田中家",
        ownerId: "user-1",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    return {
        findFamilyByUserId: vi.fn().mockResolvedValue(null),
        createFamily: vi.fn().mockResolvedValue(mockFamily),
        addFamilyMember: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}
