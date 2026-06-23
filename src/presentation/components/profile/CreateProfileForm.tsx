"use client";

import { useActionState, useState } from "react";
import { createProfileAction } from "@/app/profile/new/create-profile.action";
import type { CreateProfileResult } from "@/types/profile";
import type { ProfileAvatarIconKey } from "@/domain/models/profile/profile";
import { PROFILE_AVATAR_ICON_KEYS } from "@/domain/models/profile/profile";
import {
    DEFAULT_PROFILE_AVATAR_ICON,
    PROFILE_AVATAR_ICON_LABELS,
} from "@/constants/profile-avatar-icons";
import { ProfileAvatarIcon } from "@/presentation/components/profile/ProfileAvatarIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * プロフィール作成フォーム
 */
export function CreateProfileForm() {
    const [state, formAction, isPending] = useActionState<
        CreateProfileResult | null,
        FormData
    >(createProfileAction, null);
    const [selectedIcon, setSelectedIcon] = useState<ProfileAvatarIconKey>(
        DEFAULT_PROFILE_AVATAR_ICON,
    );

    return (
        <form action={formAction} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <ProfileAvatarIcon
                        iconKey={selectedIcon}
                        className="w-12 h-12"
                        iconClassName="w-6 h-6"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            あなたのプロフィール
                        </h2>
                        <p className="text-sm text-gray-500">
                            家族に表示される名前とアイコンを選びましょう
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="displayName">表示名</Label>
                    <Input
                        id="displayName"
                        name="displayName"
                        required
                        maxLength={30}
                        placeholder="例: たろう"
                        disabled={isPending}
                    />
                    <p className="text-sm text-gray-500">
                        30文字以内で入力してください
                    </p>
                </div>

                <div className="space-y-3">
                    <Label>アイコン</Label>
                    <input type="hidden" name="avatarIcon" value={selectedIcon} />
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {PROFILE_AVATAR_ICON_KEYS.map((iconKey) => {
                            const isSelected = selectedIcon === iconKey;

                            return (
                                <button
                                    key={iconKey}
                                    type="button"
                                    aria-label={PROFILE_AVATAR_ICON_LABELS[iconKey]}
                                    aria-pressed={isSelected}
                                    disabled={isPending}
                                    onClick={() => setSelectedIcon(iconKey)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-50"
                                            : "border-gray-200 bg-white hover:bg-gray-50",
                                    )}
                                >
                                    <ProfileAvatarIcon
                                        iconKey={iconKey}
                                        className="w-10 h-10"
                                    />
                                    <span className="text-xs text-gray-600">
                                        {PROFILE_AVATAR_ICON_LABELS[iconKey]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {state && !state.success && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-4">
                    <p className="text-sm text-rose-700">{state.error}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-3 h-auto bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500 rounded-lg font-semibold"
            >
                {isPending ? "作成中..." : "プロフィールを作成する"}
            </Button>
        </form>
    );
}
