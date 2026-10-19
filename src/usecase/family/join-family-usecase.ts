import type { Family } from "@/domain/models/family/family";
import {
    FamilyInviteErrorCode,
    familyInviteError,
} from "./family-invite-errors";
import { assertPermanentUser } from "./family-invite-guards";

export type JoinFamilyDeps = {
    isPermanentUser: () => Promise<boolean>;
    findFamilyByUserId: (userId: string) => Promise<Family | null>;
    approveFamilyInvite: (inviteId: string) => Promise<void>;
};

export type JoinFamilyInput = {
    userId: string;
    inviteId: string;
};

/**
 * 宛先本人が招待を承認し、その家族のメンバーになる。
 * 既所属は承認しない。期限・取り消し・人数上限・宛先違いはリポジトリの失敗をそのまま返す。
 * @param input 承認する人と招待
 * @param deps 本登録の判定、所属、承認
 */
export async function joinFamilyUsecase(
    input: JoinFamilyInput,
    deps: JoinFamilyDeps,
): Promise<void> {
    await assertPermanentUser(deps);
    const existing = await deps.findFamilyByUserId(input.userId);
    if (existing !== null) {
        throw familyInviteError(FamilyInviteErrorCode.ALREADY_IN_FAMILY);
    }
    await deps.approveFamilyInvite(input.inviteId);
}
