import { redirect } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import { createAuthedClient } from "@/lib/supabase/server";
import { findProfileByUserId } from "@/infrastructure/repositories/profile/profile-repository-impl";
import { CreateProfileForm } from "@/presentation/components/profile/CreateProfileForm";

/**
 * プロフィール作成画面。
 * 作成済みの場合は /top へリダイレクトする。
 */
export default async function CreateProfilePage() {
    const { user } = await createAuthedClient();
    const profile = await findProfileByUserId(user.id);

    if (profile !== null) {
        redirect("/top");
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700">
                        <UserCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-serif">
                            プロフィールを作成
                        </h1>
                        <p className="text-sm text-gray-600">
                            はじめに、あなたの表示名とアイコンを設定しましょう
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <CreateProfileForm />
            </div>
        </div>
    );
}
