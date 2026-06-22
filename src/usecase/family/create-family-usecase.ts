import type { Family } from "@/domain/models/family/family";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";

/**
 * 家族グループ作成ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type CreateFamilyDeps = {
    findFamilyByUserId: (userId: string) => Promise<Family | null>;
    createFamily: (input: CreateFamilyInput) => Promise<Family>;
    addFamilyMember: (familyId: string, userId: string) => Promise<void>;
};

/**
 * 家族グループを作成し、作成者を最初のメンバーとして登録する
 * @param input 作成入力
 * @param deps 依存するリポジトリ操作
 * @returns 作成された家族グループ
 */
export const createFamilyUsecase = async (
    input: CreateFamilyInput,
    deps: CreateFamilyDeps,
): Promise<Family> => {
    const trimmedName = input.name.trim();
    if (trimmedName.length === 0) {
        throw new Error("FAMILY_NAME_REQUIRED");
    }

    const existingFamily = await deps.findFamilyByUserId(input.ownerId);
    if (existingFamily !== null) {
        throw new Error("ALREADY_IN_FAMILY");
    }

    const family = await deps.createFamily({
        name: trimmedName,
        ownerId: input.ownerId,
    });

    await deps.addFamilyMember(family.id, input.ownerId);

    return family;
};
