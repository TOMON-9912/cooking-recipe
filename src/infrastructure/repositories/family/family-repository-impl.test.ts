// npm run test:run -- src/infrastructure/repositories/family/family-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { createFamily, findFamilyByUserId } from "./family-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";

vi.mock("@/lib/supabase/server", () => ({
    createAuthedClient: vi.fn(),
}));

describe("family-repository-impl", () => {
    const input: CreateFamilyInput = {
        name: "田中家",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createFamily 関数", () => {
        it("Family ドメインモデルを返す", async () => {
            const builder = createQueryBuilder({
                data: {
                    id: "family-1",
                    name: "田中家",
                    owner_id: "user-1",
                    created_at: "2024-01-01T00:00:00Z",
                },
                error: null,
            });
            const rpc = vi.fn().mockResolvedValue({ data: "family-1", error: null });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: {
                    rpc,
                    from: vi.fn().mockReturnValue(builder),
                } as never,
                user: { id: "user-1" } as never,
            });

            const family = await createFamily(input);

            expect(rpc).toHaveBeenCalledWith("create_family", { p_name: "田中家" });
            expect(family.id).toBe("family-1");
            expect(family.name).toBe("田中家");
            expect(family.ownerId).toBe("user-1");
            expect(family.createdAt).toEqual(new Date("2024-01-01T00:00:00Z"));
        });

        it("関数の結果が無いなら INSERT_FAILED を throw する", async () => {
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: {
                    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
                    from: vi.fn(),
                } as never,
                user: { id: "user-1" } as never,
            });

            await expect(createFamily(input)).rejects.toThrow("INSERT_FAILED");
        });

        it("所属済みは ALREADY_IN_FAMILY を throw する", async () => {
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: {
                    rpc: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "ALREADY_IN_FAMILY" },
                    }),
                    from: vi.fn(),
                } as never,
                user: { id: "user-1" } as never,
            });

            await expect(createFamily(input)).rejects.toThrow("ALREADY_IN_FAMILY");
        });
    });

    describe("findFamilyByUserId 関数", () => {
        it("所属家族の Family ドメインモデルを返す", async () => {
            const builder = createQueryBuilder({
                data: {
                    families: {
                        id: "family-1",
                        name: "田中家",
                        owner_id: "user-1",
                        created_at: "2024-01-01T00:00:00Z",
                    },
                },
                error: null,
            });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const family = await findFamilyByUserId("user-1");

            expect(family).toEqual({
                id: "family-1",
                name: "田中家",
                ownerId: "user-1",
                createdAt: new Date("2024-01-01T00:00:00Z"),
            });
            expect(builder.select).toHaveBeenCalledWith(
                "families(id, name, owner_id, created_at)",
            );
            expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
        });

        it("未所属なら null を返す", async () => {
            const builder = createQueryBuilder({ data: null, error: null });
            vi.mocked(createAuthedClient).mockResolvedValue({
                supabase: { from: vi.fn().mockReturnValue(builder) } as never,
                user: { id: "user-1" } as never,
            });

            const family = await findFamilyByUserId("user-1");

            expect(family).toBeNull();
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

            await expect(findFamilyByUserId("user-1")).rejects.toThrow(
                "select failed",
            );
        });
    });
});
