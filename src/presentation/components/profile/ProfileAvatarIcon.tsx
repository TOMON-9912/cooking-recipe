import type { ProfileAvatarIconKey } from "@/domain/models/profile/profile";
import {
    PROFILE_AVATAR_ICONS,
} from "@/constants/profile-avatar-icons";
import { cn } from "@/lib/utils";

type Props = {
    iconKey: ProfileAvatarIconKey;
    className?: string;
    iconClassName?: string;
};

/**
 * プロフィールの既定アイコンを表示する
 * @param props.iconKey アイコンキー
 * @param props.className ラッパー要素のクラス
 * @param props.iconClassName アイコン SVG のクラス
 */
export function ProfileAvatarIcon({
    iconKey,
    className,
    iconClassName,
}: Props) {
    const Icon = PROFILE_AVATAR_ICONS[iconKey];

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700",
                className,
            )}
        >
            <Icon className={cn("w-5 h-5", iconClassName)} />
        </div>
    );
}
