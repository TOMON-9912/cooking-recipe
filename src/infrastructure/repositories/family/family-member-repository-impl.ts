import { createAuthedClient } from "@/lib/supabase/server";

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
