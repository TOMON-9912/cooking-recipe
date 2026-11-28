import type { Family } from "@/domain/models/family/family";

export type CreateFamilyInput = {
    name: string;
};

export interface FamilyRepository {
    /**
     * ユーザーが所属する家族グループを取得する
     * 未所属の場合は null を返す
     * @param userId ユーザー ID
     * @returns 所属家族。未所属の場合は null
     */
    findByUserId(userId: string): Promise<Family | null>;

    /**
     * 家族グループを作成する。オーナーと最初の所属はデータベース関数が入れる
     * @param input 家族名
     * @returns 作成された家族
     */
    create(input: CreateFamilyInput): Promise<Family>;
}
