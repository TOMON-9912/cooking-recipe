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
 * PostgREST の失敗を家族作成の失敗コードへ揃える。
 * @param error クライアントが返した失敗
 */
function throwMappedCreateFamilyError(error: {
    message: string;
    details?: string | null;
}): never {
    const text = `${error.message} ${error.details ?? ""}`;
    if (text.includes("ALREADY_IN_FAMILY")) {
        throw new Error("ALREADY_IN_FAMILY");
    }
    if (text.includes("UNAUTHENTICATED")) {
        throw new Error("UNAUTHENTICATED");
    }
    throw new Error(error.message);
}

/**
 * 家族グループを作成する
 * @param input 作成入力
 * @returns 作成された家族グループ
 */
export const createFamily = async (input: CreateFamilyInput): Promise<Family> => {
    const { supabase } = await createAuthedClient();

    const { data: familyId, error } = await supabase.rpc("create_family", {
        p_name: input.name,
    });

    if (error) {
        throwMappedCreateFamilyError(error);
    }
    if (typeof familyId !== "string") {
        throw new Error("INSERT_FAILED");
    }

    const { data, error: selectError } = await supabase
        .from("families")
        .select("id, name, owner_id, created_at")
        .eq("id", familyId)
        .single();

    if (selectError) throw selectError;
    if (!data) throw new Error("INSERT_FAILED");

    return mapFamilyRow(data);
};
