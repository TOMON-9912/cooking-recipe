import { assertPermanentUser } from "./family-invite-guards";

export type JoinFamilyDeps = {
    isPermanentUser: () => Promise<boolean>;
    approveFamilyInvite: (inviteId: string) => Promise<void>;
};

export type JoinFamilyInput = {
    inviteId: string;
};

/**
 * 宛先本人が招待を承認し、その家族のメンバーになる。
 * 既所属、人数上限、宛先、使用済み化は approve の 1 回に含め、その失敗コードを返す。
 * @param input 承認する人と招待
 * @param deps 本登録の判定と承認
 */
export async function joinFamilyUsecase(
    input: JoinFamilyInput,
    deps: JoinFamilyDeps,
): Promise<void> {
    await assertPermanentUser(deps);
    await deps.approveFamilyInvite(input.inviteId);
}
