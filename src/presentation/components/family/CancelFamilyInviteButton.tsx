"use client";

import { useActionState } from "react";
import { cancelFamilyInviteAction } from "@/app/family/cancel-family-invite.action";
import type { CancelFamilyInviteResult } from "@/app/family/cancel-family-invite.action";
import { Button } from "@/components/ui/button";

type Props = {
    familyId: string;
    inviteId: string;
};

/**
 * 未使用の招待を取り消す。
 * @param props 家族と招待
 */
export function CancelFamilyInviteButton({ familyId, inviteId }: Props) {
    const [state, formAction, isPending] = useActionState<
        CancelFamilyInviteResult | null,
        FormData
    >(cancelFamilyInviteAction, null);

    return (
        <form action={formAction} className="space-y-2">
            <input type="hidden" name="familyId" value={familyId} />
            <input type="hidden" name="inviteId" value={inviteId} />
            <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                className="rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
            >
                {isPending ? "取り消しています..." : "取り消す"}
            </Button>
            {state && !state.success && (
                <p className="text-sm text-rose-700">{state.error}</p>
            )}
        </form>
    );
}
