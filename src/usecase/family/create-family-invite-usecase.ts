import type { FamilyInviteSummary } from "@/domain/models/family/family-invite";
import {
    type FamilyInviteActorDeps,
    assertOwner,
    normalizeInviteEmail,
} from "./family-invite-guards";

export type CreateFamilyInviteInput = {
    familyId: string;
    invitedEmail: string;
};

export type CreateFamilyInviteDeps = FamilyInviteActorDeps & {
    createFamilyInvite: (input: {
        familyId: string;
        invitedEmail: string;
    }) => Promise<FamilyInviteSummary>;
};

/**
 * オーナーが、宛先メールを指定して招待を 1 件発行する。
 * 同じ宛先の期限内未使用は、リポジトリ（DB 関数）が拒否する。
 * @param input 家族と宛先
 * @param deps 操作者の判定と発行
 * @returns 発行した招待
 */
export async function createFamilyInviteUsecase(
    input: CreateFamilyInviteInput,
    deps: CreateFamilyInviteDeps,
): Promise<FamilyInviteSummary> {
    await assertOwner(input.familyId, deps);
    const invitedEmail = normalizeInviteEmail(input.invitedEmail);
    return deps.createFamilyInvite({
        familyId: input.familyId,
        invitedEmail,
    });
}
