// npm run test:run -- src/infrastructure/repositories/profile/profile-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { createProfile, findProfileByUserId } from "./profile-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
    createAuthedClient: vi.fn(),
}));

describe("profile-repository-impl", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findProfileByUserId 関数", () => {
        it("Profile ドメインモデルを返す", async () => {
            const builder = createQueryBuilder({
                data: {
                    id: "user-1",
                    display_name: "たろう",
                    avatar_icon: "user",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                },
                error: null,
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const profile = await findProfileByUserId("user-1");

            expect(profile?.displayName).toBe("たろう");
            expect(profile?.avatarIcon).toBe("user");
            expect(builder.eq).toHaveBeenCalledWith("id", "user-1");
        });

        it("未作成なら null を返す", async () => {
            const builder = createQueryBuilder({ data: null, error: null });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const profile = await findProfileByUserId("user-1");

            expect(profile).toBeNull();
        });
    });

    describe("createProfile 関数", () => {
        it("profiles テーブルに insert する", async () => {
            const builder = createQueryBuilder({
                data: {
                    id: "user-1",
                    display_name: "たろう",
                    avatar_icon: "chef-hat",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                },
                error: null,
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const profile = await createProfile({
                userId: "user-1",
                displayName: "たろう",
                avatarIcon: "chef-hat",
            });

            expect(builder.insert).toHaveBeenCalledWith({
                id: "user-1",
                display_name: "たろう",
                avatar_icon: "chef-hat",
            });
            expect(profile.avatarIcon).toBe("chef-hat");
        });
    });
});
