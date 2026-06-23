import {
    ChefHat,
    Coffee,
    Heart,
    Home,
    Leaf,
    Smile,
    User,
    UtensilsCrossed,
    type LucideIcon,
} from "lucide-react";
import type { ProfileAvatarIconKey } from "@/domain/models/profile/profile";

/** 既定アイコンの表示ラベル */
export const PROFILE_AVATAR_ICON_LABELS: Record<ProfileAvatarIconKey, string> = {
    "chef-hat": "シェフ",
    utensils: "食器",
    heart: "ハート",
    home: "おうち",
    smile: "スマイル",
    user: "ユーザー",
    coffee: "コーヒー",
    leaf: "リーフ",
};

/** 既定アイコンの Lucide コンポーネント */
export const PROFILE_AVATAR_ICONS: Record<ProfileAvatarIconKey, LucideIcon> = {
    "chef-hat": ChefHat,
    utensils: UtensilsCrossed,
    heart: Heart,
    home: Home,
    smile: Smile,
    user: User,
    coffee: Coffee,
    leaf: Leaf,
};

/** プロフィール作成フォームのデフォルトアイコン */
export const DEFAULT_PROFILE_AVATAR_ICON: ProfileAvatarIconKey = "user";
