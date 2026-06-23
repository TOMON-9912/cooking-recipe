import type { Family } from "@/domain/models/family/family";
import type { FamilyMember } from "@/domain/models/family/family-member";

/** 所属家族とメンバー一覧の表示用データ */
export type FamilyOverview = {
    family: Family | null;
    members: FamilyMember[];
};

/**
 * 家族グループ表示ユースケースが依存する処理。
 * app 層で infrastructure の実装を渡す。
 */
export type GetFamilyOverviewDeps = {
    findFamilyByUserId: (userId: string) => Promise<Family | null>;
    findFamilyMembersByFamilyId: (familyId: string) => Promise<FamilyMember[]>;
};

/**
 * ユーザーの所属家族とメンバー一覧を取得する
 * @param userId ユーザー ID
 * @param deps 依存するリポジトリ操作
 * @returns 家族概要。未所属の場合は family が null
 */
export const getFamilyOverviewUsecase = async (
    userId: string,
    deps: GetFamilyOverviewDeps,
): Promise<FamilyOverview> => {
    const family = await deps.findFamilyByUserId(userId);

    if (family === null) {
        return { family: null, members: [] };
    }

    const members = await deps.findFamilyMembersByFamilyId(family.id);

    return { family, members };
};
