import { vi } from "vitest";
import type { Profile } from "@/domain/models/profile/profile";
import type { CreateProfileDeps } from "./create-profile-usecase";

/**
 * テスト用の CreateProfileDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの CreateProfileDeps
 */
export function createProfileDepsForTest(
    overrides: Partial<CreateProfileDeps> = {},
): CreateProfileDeps {
    const mockProfile: Profile = {
        userId: "user-1",
        displayName: "たろう",
        avatarIcon: "user",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
    };

    return {
        findProfileByUserId: vi.fn().mockResolvedValue(null),
        createProfile: vi.fn().mockResolvedValue(mockProfile),
        ...overrides,
    };
}
