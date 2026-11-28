import type { Family } from "@/domain/models/family/family";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";

/**
 * 家族グループ作成ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type CreateFamilyDeps = {
    createFamily: (input: CreateFamilyInput) => Promise<Family>;
};

/**
 * 家族名を整え、家族を1件作成する。
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

    return deps.createFamily({ name: trimmedName });
};
