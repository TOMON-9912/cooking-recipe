// npm run test:run -- src/usecase/family/create-family-usecase.test.ts
import { describe, expect, it } from "vitest";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";
import { createFamilyUsecase } from "./create-family-usecase";
import { createFamilyDepsForTest } from "./create-family-deps-for-test";

describe("createFamilyUsecase 関数", () => {
    const input: CreateFamilyInput = {
        name: "田中家",
    };

    it("家族名を渡して作成する", async () => {
        const deps = createFamilyDepsForTest();

        const family = await createFamilyUsecase(input, deps);

        expect(deps.createFamily).toHaveBeenCalledWith({ name: "田中家" });
        expect(family.id).toBe("family-1");
    });

    it("名前の前後空白は trim して createFamily に渡す", async () => {
        const deps = createFamilyDepsForTest();

        await createFamilyUsecase({ name: "  田中家  " }, deps);

        expect(deps.createFamily).toHaveBeenCalledWith({ name: "田中家" });
    });

    it("名前が空なら FAMILY_NAME_REQUIRED を throw する", async () => {
        const deps = createFamilyDepsForTest();

        await expect(createFamilyUsecase({ name: "   " }, deps)).rejects.toThrow(
            "FAMILY_NAME_REQUIRED",
        );
        expect(deps.createFamily).not.toHaveBeenCalled();
    });
});
