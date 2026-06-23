import { createAuthedClient } from "@/lib/supabase/server";
import { findFamilyByUserId } from "@/infrastructure/repositories/family/family-repository-impl";
import { findFamilyMembersByFamilyId } from "@/infrastructure/repositories/family/family-member-repository-impl";
import { getFamilyOverviewUsecase } from "@/usecase/family/get-family-overview-usecase";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";
import { FamilyOverviewSection } from "@/presentation/components/family/FamilyOverviewSection";

/**
 * 家族グループ画面。
 * 未所属の場合は作成フォーム、所属済みの場合は家族概要とメンバー一覧を表示する。
 */
export default async function FamilyPage() {
    const { user } = await createAuthedClient();

    const overview = await getFamilyOverviewUsecase(user.id, {
        findFamilyByUserId,
        findFamilyMembersByFamilyId,
    });

    const isMember = overview.family !== null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 font-serif">
                    {isMember ? "家族グループ" : "家族グループを作る"}
                </h1>
                <p className="text-sm text-gray-600">
                    {isMember
                        ? "家族のメンバーと一緒にレシピを共有できます"
                        : "家族の味を、ここに残すための共有スペースを作成します"}
                </p>
            </div>
            <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                {overview.family ? (
                    <FamilyOverviewSection
                        family={overview.family}
                        members={overview.members}
                        currentUserId={user.id}
                    />
                ) : (
                    <CreateFamilyForm />
                )}
            </div>
        </div>
    );
}
