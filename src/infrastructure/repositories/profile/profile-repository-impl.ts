import type { Profile } from "@/domain/models/profile/profile";
import type { CreateProfileInput } from "@/domain/repositories/profile/profile-repository";
import { isProfileAvatarIconKey } from "@/domain/models/profile/profile";
import { createAuthedClient } from "@/lib/supabase/server";

type ProfileRow = {
    id: string;
    display_name: string;
    avatar_icon: string;
    created_at: string;
    updated_at: string;
};

const mapProfileRow = (row: ProfileRow): Profile => {
    if (!isProfileAvatarIconKey(row.avatar_icon)) {
        throw new Error("INVALID_AVATAR_ICON");
    }

    return {
        userId: row.id,
        displayName: row.display_name,
        avatarIcon: row.avatar_icon,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
};

/**
 * ユーザー ID でプロフィールを取得する
 * @param userId ユーザー ID
 * @returns プロフィール。未作成の場合は null
 */
export const findProfileByUserId = async (
    userId: string,
): Promise<Profile | null> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_icon, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapProfileRow(data as ProfileRow);
};

/**
 * プロフィールを新規作成する
 * @param input 作成入力
 * @returns 作成されたプロフィール
 */
export const createProfile = async (
    input: CreateProfileInput,
): Promise<Profile> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("profiles")
        .insert({
            id: input.userId,
            display_name: input.displayName,
            avatar_icon: input.avatarIcon,
        })
        .select("id, display_name, avatar_icon, created_at, updated_at")
        .single();

    if (error) throw error;
    if (!data) throw new Error("INSERT_FAILED");

    return mapProfileRow(data as ProfileRow);
};
