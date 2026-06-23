// npm run test:run -- src/usecase/family/get-family-overview-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { getFamilyOverviewUsecase } from "./get-family-overview-usecase";
import { getFamilyOverviewDepsForTest } from "./get-family-overview-deps-for-test";

describe("getFamilyOverviewUsecase 関数", () => {
    it("所属家族とメンバー一覧を返す", async () => {
        const deps = getFamilyOverviewDepsForTest();

        const overview = await getFamilyOverviewUsecase("user-1", deps);

        expect(deps.findFamilyByUserId).toHaveBeenCalledWith("user-1");
        expect(deps.findFamilyMembersByFamilyId).toHaveBeenCalledWith("family-1");
        expect(overview.family?.name).toBe("田中家");
        expect(overview.members).toHaveLength(1);
    });

    it("未所属なら family null と空の members を返す", async () => {
        const deps = getFamilyOverviewDepsForTest({
            findFamilyByUserId: vi.fn().mockResolvedValue(null),
        });

        const overview = await getFamilyOverviewUsecase("user-1", deps);

        expect(overview).toEqual({ family: null, members: [] });
        expect(deps.findFamilyMembersByFamilyId).not.toHaveBeenCalled();
    });

    it("findFamilyByUserId が失敗したら例外を throw する", async () => {
        const deps = getFamilyOverviewDepsForTest({
            findFamilyByUserId: vi.fn().mockRejectedValue(new Error("fetch failed")),
        });

        await expect(getFamilyOverviewUsecase("user-1", deps)).rejects.toThrow(
            "fetch failed",
        );
    });
});
