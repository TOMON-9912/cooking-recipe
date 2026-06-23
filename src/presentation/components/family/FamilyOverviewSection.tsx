import { Users } from "lucide-react";
import type { Family } from "@/domain/models/family/family";
import type { FamilyMember } from "@/domain/models/family/family-member";
import { Badge } from "@/components/ui/badge";

type Props = {
    family: Family;
    members: FamilyMember[];
    currentUserId: string;
};

/**
 * 参加日を表示用に整形する
 * @param date 参加日時
 * @returns 日本語形式の日付文字列
 */
function formatJoinedAt(date: Date): string {
    return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * 所属家族の概要とメンバー一覧を表示する
 */
export function FamilyOverviewSection({
    family,
    members,
    currentUserId,
}: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {family.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                            あなたの家族グループです
                        </p>
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        メンバー一覧
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {members.length} 人が参加しています
                    </p>
                </div>

                {members.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        メンバーがまだいません
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {members.map((member) => {
                            const isOwner = member.userId === family.ownerId;
                            const isCurrentUser =
                                member.userId === currentUserId;

                            return (
                                <li
                                    key={member.userId}
                                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {isCurrentUser
                                                    ? "あなた"
                                                    : `メンバー (${member.userId.slice(0, 8)}…)`}
                                            </span>
                                            {isOwner && (
                                                <Badge className="rounded-md bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                                                    オーナー
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            参加日: {formatJoinedAt(member.joinedAt)}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
