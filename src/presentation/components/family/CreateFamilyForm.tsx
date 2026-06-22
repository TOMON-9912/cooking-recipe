"use client";

import { useActionState } from "react";
import { Users } from "lucide-react";
import { createFamilyAction } from "@/app/family/new/create-family.action";
import type { CreateFamilyResult } from "@/types/family";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * 家族グループ作成フォーム
 */
export function CreateFamilyForm() {
    const [state, formAction, isPending] = useActionState<
        CreateFamilyResult | null,
        FormData
    >(createFamilyAction, null);

    return (
        <form action={formAction} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            家族グループ名
                        </h2>
                        <p className="text-sm text-gray-500">
                            レシピを共有する家族の名前を決めましょう
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">家族名</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        maxLength={50}
                        placeholder="例: 田中家"
                        disabled={isPending}
                    />
                    <p className="text-sm text-gray-500">
                        作成後、あなたが最初のメンバーとして参加します
                    </p>
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
                {isPending ? "作成中..." : "家族グループを作成する"}
            </Button>
        </form>
    );
}
