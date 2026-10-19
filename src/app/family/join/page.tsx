import Link from "next/link";
import { createAuthedClient } from "@/lib/supabase/server";
import { findFamilyByUserId } from "@/infrastructure/repositories/family/family-repository-impl";
import {
    isPermanentUser,
    listMyFamilyInvites,
} from "@/infrastructure/repositories/family/family-invite-repository-impl";
import { listMyFamilyInvitesUsecase } from "@/usecase/family/list-my-family-invites-usecase";
import { JoinFamilyForm } from "@/presentation/components/family/JoinFamilyForm";

type Props = {
    searchParams: Promise<{ invite?: string }>;
};

/**
 * 期限を画面用の日付にする。
 * @param date 期限
 * @returns 日本語の日付
 */
function formatExpiresAt(date: Date): string {
    return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * 自分宛ての招待を承認する画面。
 * @param props 事前に選んだ招待
 */
export default async function FamilyJoinPage({ searchParams }: Props) {
    const { invite } = await searchParams;
    const permanent = await isPermanentUser();
    const { user } = await createAuthedClient();
    const family = permanent ? await findFamilyByUserId(user.id) : null;
    const invites = permanent
        ? await listMyFamilyInvitesUsecase({
              isPermanentUser,
              listMyFamilyInvites,
          })
        : [];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">
                        家族に参加する
                    </h1>
                    <p className="text-sm text-gray-600">
                        自分宛ての招待を確かめてから参加します
                    </p>
                </div>

                {!permanent && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            ゲストのままでは参加できません。本登録してから、もう一度開いてください。
                        </p>
                        <Link href="/signup" className="text-sm text-emerald-700">
                            本登録へ
                        </Link>
                    </div>
                )}

                {permanent && family && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            すでに家族に入っています
                        </p>
                        <Link
                            href="/family"
                            className="inline-flex px-6 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-lg"
                        >
                            家族グループを見る
                        </Link>
                    </div>
                )}

                {permanent && !family && invites.length === 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            この招待は使えません。オーナーに、もう一度発行してもらってください。
                        </p>
                        <Link href="/family" className="text-sm text-emerald-700">
                            家族グループへ
                        </Link>
                    </div>
                )}

                {permanent && !family && invites.length > 0 && (
                    <JoinFamilyForm
                        selectedInviteId={invite}
                        invites={invites.map((item) => ({
                            id: item.id,
                            familyName: item.familyName,
                            expiresAtLabel: formatExpiresAt(item.expiresAt),
                        }))}
                    />
                )}
            </div>
        </div>
    );
}
