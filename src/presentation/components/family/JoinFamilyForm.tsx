"use client";

import { useActionState } from "react";
import { joinFamilyAction } from "@/app/family/join/join-family.action";
import type { JoinFamilyResult } from "@/app/family/join/join-family.action";
import { Button } from "@/components/ui/button";

type InviteChoice = {
    id: string;
    familyName: string;
    expiresAtLabel: string;
};

type Props = {
    invites: InviteChoice[];
    selectedInviteId?: string;
};

/**
 * 自分宛ての招待から 1 件を選んで参加する。
 * @param props 選べる招待
 */
export function JoinFamilyForm({ invites, selectedInviteId }: Props) {
    const [state, formAction, isPending] = useActionState<
        JoinFamilyResult | null,
        FormData
    >(joinFamilyAction, null);
    const defaultId = selectedInviteId ?? invites[0]?.id;

    return (
        <form action={formAction} className="space-y-4">
            <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-gray-900">
                    参加する家族
                </legend>
                {invites.map((invite) => (
                    <label
                        key={invite.id}
                        className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4"
                    >
                        <input
                            type="radio"
                            name="inviteId"
                            value={invite.id}
                            defaultChecked={invite.id === defaultId}
                            className="mt-1"
                        />
                        <span>
                            <span className="block text-sm font-medium text-gray-900">
                                {invite.familyName}
                            </span>
                            <span className="block text-sm text-gray-500">
                                {invite.expiresAtLabel} まで
                            </span>
                        </span>
                    </label>
                ))}
            </fieldset>
            {state && (
                <p className="text-sm text-rose-700">{state.error}</p>
            )}
            <Button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 h-auto bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold"
            >
                {isPending ? "参加しています..." : "この家族に参加する"}
            </Button>
        </form>
    );
}
