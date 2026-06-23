// npm run test:run -- src/usecase/family/create-family-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";
import { createFamilyUsecase } from "./create-family-usecase";
import { createFamilyDepsForTest } from "./create-family-deps-for-test";

describe("createFamilyUsecase 関数", () => {
    const input: CreateFamilyInput = {
        name: "田中家",
        ownerId: "user-1",
    };

    it("家族グループ作成後に作成者をメンバー追加する", async () => {
        const deps = createFamilyDepsForTest();

        const family = await createFamilyUsecase(input, deps);

        expect(deps.findFamilyByUserId).toHaveBeenCalledWith("user-1");
        expect(deps.createFamily).toHaveBeenCalledWith({
            name: "田中家",
            ownerId: "user-1",
        });
        expect(deps.addFamilyMember).toHaveBeenCalledWith("family-1", "user-1");
        expect(family.id).toBe("family-1");
    });

    it("名前の前後空白は trim して createFamily に渡す", async () => {
        const deps = createFamilyDepsForTest();

        await createFamilyUsecase({ ...input, name: "  田中家  " }, deps);

        expect(deps.createFamily).toHaveBeenCalledWith({
            name: "田中家",
            ownerId: "user-1",
        });
    });

    it("既に家族に所属している場合は ALREADY_IN_FAMILY を throw する", async () => {
        const deps = createFamilyDepsForTest({
            findFamilyByUserId: vi.fn().mockResolvedValue({
                id: "family-existing",
                name: "既存家",
                ownerId: "user-1",
                createdAt: new Date(),
            }),
        });

        await expect(createFamilyUsecase(input, deps)).rejects.toThrow(
            "ALREADY_IN_FAMILY",
        );
        expect(deps.createFamily).not.toHaveBeenCalled();
        expect(deps.addFamilyMember).not.toHaveBeenCalled();
    });

    it("名前が空なら FAMILY_NAME_REQUIRED を throw する", async () => {
        const deps = createFamilyDepsForTest();

        await expect(
            createFamilyUsecase({ ...input, name: "   " }, deps),
        ).rejects.toThrow("FAMILY_NAME_REQUIRED");
        expect(deps.createFamily).not.toHaveBeenCalled();
    });

    it("createFamily が失敗したら addFamilyMember を呼ばない", async () => {
        const deps = createFamilyDepsForTest({
            createFamily: vi.fn().mockRejectedValue(new Error("create failed")),
        });

        await expect(createFamilyUsecase(input, deps)).rejects.toThrow(
            "create failed",
        );
        expect(deps.addFamilyMember).not.toHaveBeenCalled();
    });
});
