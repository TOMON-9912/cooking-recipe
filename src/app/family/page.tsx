import Link from "next/link";
import { createAuthedClient } from "@/lib/supabase/server";
import { findFamilyByUserId } from "@/infrastructure/repositories/family/family-repository-impl";
import { findFamilyMembersByFamilyId } from "@/infrastructure/repositories/family/family-member-repository-impl";
import {
    findFamilyInvitesByFamilyId,
    isOwnerOfFamily,
    isPermanentUser,
    listMyFamilyInvites,
} from "@/infrastructure/repositories/family/family-invite-repository-impl";
import { getFamilyOverviewUsecase } from "@/usecase/family/get-family-overview-usecase";
import { listFamilyInvitesUsecase } from "@/usecase/family/list-family-invites-usecase";
import { listMyFamilyInvitesUsecase } from "@/usecase/family/list-my-family-invites-usecase";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";
import { FamilyOverviewSection } from "@/presentation/components/family/FamilyOverviewSection";
import { InviteFamilyForm } from "@/presentation/components/family/InviteFamilyForm";
import { CancelFamilyInviteButton } from "@/presentation/components/family/CancelFamilyInviteButton";
import type { FamilyInviteSummary } from "@/domain/models/family/family-invite";
import type { MyFamilyInvite } from "@/domain/models/family/family-invite";

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
 * 家族グループ画面。
 * 未所属なら作成か自分宛ての招待、オーナーなら招待の発行を出す。
 */
export default async function FamilyPage() {
    const { user } = await createAuthedClient();
    const permanent = await isPermanentUser();
    const overview = await getFamilyOverviewUsecase(user.id, {
        findFamilyByUserId,
        findFamilyMembersByFamilyId,
    });
    const family = overview.family;
    const isOwner = family !== null && family.ownerId === user.id;

    let myInvites: MyFamilyInvite[] = [];
    if (permanent) {
        myInvites = await listMyFamilyInvitesUsecase({
            isPermanentUser,
            listMyFamilyInvites,
        });
    }

    let activeInvites: FamilyInviteSummary[] = [];
    if (family && isOwner && permanent) {
        activeInvites = await listFamilyInvitesUsecase(family.id, {
            isPermanentUser,
            isOwnerOfFamily,
            listFamilyInvites: findFamilyInvitesByFamilyId,
        });
    }

    const heading = family
        ? "家族グループ"
        : myInvites.length > 0
          ? "自分宛ての招待"
          : "家族グループを作る";

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-serif">
                    {heading}
                </h1>
                <p className="text-sm text-gray-600">
                    家族の味を、ここに残すための共有スペースです
                </p>
            </div>
            <div className="w-full max-w-3xl mx-auto px-4 pb-12 space-y-8">
                {!permanent && (
                    <p className="text-sm text-gray-700">
                        招待の発行と参加は、本登録のあとで使えます。
                        <Link href="/signup" className="ml-2 text-emerald-700">
                            本登録へ
                        </Link>
                    </p>
                )}

                {family && (
                    <FamilyOverviewSection
                        family={family}
                        members={overview.members}
                        currentUserId={user.id}
                    />
                )}

                {family && myInvites.length > 0 && (
                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                            自分宛ての招待
                        </h2>
                        <p className="text-sm text-gray-700">
                            すでに家族に入っているので、別の家族には参加できません。
                        </p>
                        <ul className="space-y-2">
                            {myInvites.map((invite) => (
                                <li
                                    key={invite.id}
                                    className="text-sm text-gray-700"
                                >
                                    {invite.familyName}（
                                    {formatExpiresAt(invite.expiresAt)} まで）
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {!family && myInvites.length > 0 && (
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            招待されている家族
                        </h2>
                        <ul className="space-y-2">
                            {myInvites.map((invite) => (
                                <li
                                    key={invite.id}
                                    className="text-sm text-gray-700"
                                >
                                    {invite.familyName}（
                                    {formatExpiresAt(invite.expiresAt)} まで）
                                </li>
                            ))}
                        </ul>
                        {permanent && (
                            <Link
                                href="/family/join"
                                className="inline-flex px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                            >
                                承認画面へ
                            </Link>
                        )}
                    </section>
                )}

                {isOwner && permanent && family && (
                    <div className="space-y-4">
                        <InviteFamilyForm
                            familyId={family.id}
                            hasActiveInvites={activeInvites.length > 0}
                        />
                        {activeInvites.length > 0 && (
                            <ul className="space-y-3">
                                {activeInvites.map((invite) => (
                                    <li
                                        key={invite.id}
                                        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {invite.invitedEmail}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatExpiresAt(invite.expiresAt)}{" "}
                                                まで
                                            </p>
                                        </div>
                                        <CancelFamilyInviteButton
                                            familyId={family.id}
                                            inviteId={invite.id}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {!family && (
                    <CreateFamilyForm
                        emphasis={myInvites.length > 0 ? "secondary" : "primary"}
                    />
                )}
            </div>
        </div>
    );
}
