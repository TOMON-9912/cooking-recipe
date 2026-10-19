"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { createFamilyInviteAction } from "@/app/family/create-family-invite.action";
import type { CreateFamilyInviteResult } from "@/app/family/create-family-invite.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
    familyId: string;
    hasActiveInvites: boolean;
};

/**
 * 案内の URL をコピーする。
 */
async function copyGuideUrl(): Promise<void> {
    const url = `${window.location.origin}/family`;
    await navigator.clipboard.writeText(url);
}

/**
 * オーナーが宛先を指定して招待を発行するフォーム。
 * @param props 家族 ID と、未使用の招待があるか
 */
export function InviteFamilyForm({ familyId, hasActiveInvites }: Props) {
    const [state, formAction, isPending] = useActionState<
        CreateFamilyInviteResult | null,
        FormData
    >(createFamilyInviteAction, null);

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        家族を招待する
                    </h2>
                    <p className="text-sm text-gray-500">
                        {hasActiveInvites
                            ? "期限内で未使用の招待だけを表示しています"
                            : "宛先のメールアドレスを入れると、招待を発行できます"}
                    </p>
                </div>
            </div>

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="familyId" value={familyId} />
                <div className="space-y-2">
                    <Label htmlFor="invitedEmail">宛先のメールアドレス</Label>
                    <Input
                        id="invitedEmail"
                        name="invitedEmail"
                        type="email"
                        required
                        placeholder="example@example.com"
                        disabled={isPending}
                    />
                </div>
                {state && !state.success && (
                    <p className="text-sm text-rose-700">{state.error}</p>
                )}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 h-auto bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold"
                >
                    {isPending ? "発行しています..." : "招待する"}
                </Button>
            </form>

            {state?.success && (
                <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm text-gray-700">
                        案内の URL は /family です。相手に渡してください。
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg border-emerald-200 text-emerald-700"
                        onClick={() => {
                            void copyGuideUrl();
                        }}
                    >
                        案内をコピー
                    </Button>
                </div>
            )}
        </section>
    );
}
