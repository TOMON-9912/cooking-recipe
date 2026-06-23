// npm run test:run -- src/usecase/profile/create-profile-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { CreateProfileInput } from "@/domain/repositories/profile/profile-repository";
import { createProfileUsecase } from "./create-profile-usecase";
import { createProfileDepsForTest } from "./create-profile-deps-for-test";

describe("createProfileUsecase 関数", () => {
    const input: CreateProfileInput = {
        userId: "user-1",
        displayName: "たろう",
        avatarIcon: "user",
    };

    it("プロフィールを作成する", async () => {
        const deps = createProfileDepsForTest();

        const profile = await createProfileUsecase(input, deps);

        expect(deps.findProfileByUserId).toHaveBeenCalledWith("user-1");
        expect(deps.createProfile).toHaveBeenCalledWith({
            userId: "user-1",
            displayName: "たろう",
            avatarIcon: "user",
        });
        expect(profile.displayName).toBe("たろう");
    });

    it("表示名の前後空白は trim して createProfile に渡す", async () => {
        const deps = createProfileDepsForTest();

        await createProfileUsecase({ ...input, displayName: "  たろう  " }, deps);

        expect(deps.createProfile).toHaveBeenCalledWith({
            userId: "user-1",
            displayName: "たろう",
            avatarIcon: "user",
        });
    });

    it("既にプロフィールがある場合は PROFILE_ALREADY_EXISTS を throw する", async () => {
        const deps = createProfileDepsForTest({
            findProfileByUserId: vi.fn().mockResolvedValue({
                userId: "user-1",
                displayName: "既存",
                avatarIcon: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        });

        await expect(createProfileUsecase(input, deps)).rejects.toThrow(
            "PROFILE_ALREADY_EXISTS",
        );
        expect(deps.createProfile).not.toHaveBeenCalled();
    });

    it("表示名が空なら DISPLAY_NAME_REQUIRED を throw する", async () => {
        const deps = createProfileDepsForTest();

        await expect(
            createProfileUsecase({ ...input, displayName: "   " }, deps),
        ).rejects.toThrow("DISPLAY_NAME_REQUIRED");
        expect(deps.createProfile).not.toHaveBeenCalled();
    });

    it("表示名が長すぎる場合は DISPLAY_NAME_TOO_LONG を throw する", async () => {
        const deps = createProfileDepsForTest();

        await expect(
            createProfileUsecase(
                { ...input, displayName: "あ".repeat(31) },
                deps,
            ),
        ).rejects.toThrow("DISPLAY_NAME_TOO_LONG");
        expect(deps.createProfile).not.toHaveBeenCalled();
    });

    it("不正なアイコンキーなら INVALID_AVATAR_ICON を throw する", async () => {
        const deps = createProfileDepsForTest();

        await expect(
            createProfileUsecase(
                { ...input, avatarIcon: "invalid" as "user" },
                deps,
            ),
        ).rejects.toThrow("INVALID_AVATAR_ICON");
        expect(deps.createProfile).not.toHaveBeenCalled();
    });
});
