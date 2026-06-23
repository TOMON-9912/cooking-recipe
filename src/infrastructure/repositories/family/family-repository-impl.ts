import type { Family } from "@/domain/models/family/family";
import type { CreateFamilyInput } from "@/domain/repositories/family/family-repository";
import { createAuthedClient } from "@/lib/supabase/server";

type FamilyRow = {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
};

const mapFamilyRow = (row: FamilyRow): Family => ({
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at),
});

/**
 * ユーザーが所属する家族グループを取得する
 * @param userId ユーザー ID
 * @returns 所属家族。未所属の場合は null
 */
export const findFamilyByUserId = async (userId: string): Promise<Family | null> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("family_members")
        .select("families(id, name, owner_id, created_at)")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    const familyRow = data?.families as FamilyRow | null | undefined;
    if (!familyRow) return null;

    return mapFamilyRow(familyRow);
};

/**
 * 家族グループを作成する
 * @param input 作成入力
 * @returns 作成された家族グループ
 */
export const createFamily = async (input: CreateFamilyInput): Promise<Family> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("families")
        .insert({
            name: input.name,
            owner_id: input.ownerId,
        })
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new Error("INSERT_FAILED");

    return mapFamilyRow(data);
};
