import type { FamilyMember } from "@/domain/models/family/family-member";
import { createAuthedClient } from "@/lib/supabase/server";

type FamilyMemberRow = {
    family_id: string;
    user_id: string;
    joined_at: string;
};

const mapFamilyMemberRow = (row: FamilyMemberRow): FamilyMember => ({
    familyId: row.family_id,
    userId: row.user_id,
    joinedAt: new Date(row.joined_at),
});

/**
 * 家族グループにメンバーを追加する
 * @param familyId 家族グループ ID
 * @param userId 追加するユーザー ID
 */
export const addFamilyMember = async (
    familyId: string,
    userId: string,
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const { error } = await supabase
        .from("family_members")
        .insert({
            family_id: familyId,
            user_id: userId,
        });

    if (error) throw error;
};

/**
 * 家族グループのメンバー一覧を取得する
 * @param familyId 家族グループ ID
 * @returns メンバー一覧（参加日時の昇順）
 */
export const findFamilyMembersByFamilyId = async (
    familyId: string,
): Promise<FamilyMember[]> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("family_members")
        .select("family_id, user_id, joined_at")
        .eq("family_id", familyId)
        .order("joined_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => mapFamilyMemberRow(row as FamilyMemberRow));
};
