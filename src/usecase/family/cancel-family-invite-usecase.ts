import {
    type FamilyInviteActorDeps,
    assertOwner,
} from "./family-invite-guards";

export type CancelFamilyInviteInput = {
    familyId: string;
    inviteId: string;
};

export type CancelFamilyInviteDeps = FamilyInviteActorDeps & {
    cancelFamilyInvite: (inviteId: string) => Promise<void>;
};

/**
 * オーナーが、未使用の招待を取り消す。使用済みはリポジトリが拒否する。
 * @param input 家族と招待
 * @param deps 操作者の判定と取り消し
 */
export async function cancelFamilyInviteUsecase(
    input: CancelFamilyInviteInput,
    deps: CancelFamilyInviteDeps,
): Promise<void> {
    await assertOwner(input.familyId, deps);
    await deps.cancelFamilyInvite(input.inviteId);
}
