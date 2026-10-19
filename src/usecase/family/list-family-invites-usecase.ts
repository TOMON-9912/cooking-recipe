import type {
    FamilyInviteRecord,
    FamilyInviteSummary,
} from "@/domain/models/family/family-invite";
import {
    type FamilyInviteActorDeps,
    assertOwner,
} from "./family-invite-guards";

export type ListFamilyInvitesDeps = FamilyInviteActorDeps & {
    listFamilyInvites: (familyId: string) => Promise<FamilyInviteRecord[]>;
    now?: () => Date;
};

/**
 * 期限内・未使用・未取り消しの招待だけを残す。
 * @param records リポジトリが返した招待
 * @param now 期限の比較に使う現在時刻
 * @returns オーナーの一覧に出してよい招待
 */
export function activeFamilyInvites(
    records: FamilyInviteRecord[],
    now: Date,
): FamilyInviteSummary[] {
    return records
        .filter(
            (record) =>
                record.revokedAt === null &&
                record.usedAt === null &&
                record.expiresAt.getTime() > now.getTime(),
        )
        .map(({ id, invitedEmail, expiresAt }) => ({
            id,
            invitedEmail,
            expiresAt,
        }));
}

/**
 * オーナーが、期限内で未使用の招待一覧を確かめる。
 * @param familyId 対象の家族
 * @param deps 操作者の判定と一覧
 * @returns 宛先と期限
 */
export async function listFamilyInvitesUsecase(
    familyId: string,
    deps: ListFamilyInvitesDeps,
): Promise<FamilyInviteSummary[]> {
    await assertOwner(familyId, deps);
    const records = await deps.listFamilyInvites(familyId);
    return activeFamilyInvites(records, deps.now?.() ?? new Date());
}
