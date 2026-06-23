// npm run test:run -- src/infrastructure/repositories/family/family-member-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { addFamilyMember, findFamilyMembersByFamilyId } from "./family-member-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
    createAuthedClient: vi.fn(),
}));

describe("family-member-repository-impl", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("addFamilyMember 関数", () => {
        it("family_members テーブルに insert する", async () => {
            const builder = createQueryBuilder({ data: null, error: null });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            await addFamilyMember("family-1", "user-1");

            expect(builder.insert).toHaveBeenCalledWith({
                family_id: "family-1",
                user_id: "user-1",
            });
        });

        it("DB エラー時は throw する", async () => {
            const builder = createQueryBuilder({
                data: null,
                error: new Error("insert failed"),
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            await expect(addFamilyMember("family-1", "user-1")).rejects.toThrow(
                "insert failed",
            );
        });
    });

    describe("findFamilyMembersByFamilyId 関数", () => {
        it("FamilyMember ドメインモデルの配列を返す", async () => {
            const builder = createQueryBuilder({
                data: [
                    {
                        family_id: "family-1",
                        user_id: "user-1",
                        joined_at: "2024-01-01T00:00:00Z",
                    },
                    {
                        family_id: "family-1",
                        user_id: "user-2",
                        joined_at: "2024-02-01T00:00:00Z",
                    },
                ],
                error: null,
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const members = await findFamilyMembersByFamilyId("family-1");

            expect(members).toHaveLength(2);
            expect(members[0].userId).toBe("user-1");
            expect(members[1].joinedAt).toEqual(new Date("2024-02-01T00:00:00Z"));
            expect(builder.eq).toHaveBeenCalledWith("family_id", "family-1");
            expect(builder.order).toHaveBeenCalledWith("joined_at", {
                ascending: true,
            });
        });

        it("DB エラー時は throw する", async () => {
            const builder = createQueryBuilder({
                data: null,
                error: new Error("select failed"),
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            await expect(findFamilyMembersByFamilyId("family-1")).rejects.toThrow(
                "select failed",
            );
        });
    });
});
