import type { MyFamilyInvite } from "@/domain/models/family/family-invite";
import { assertPermanentUser } from "./family-invite-guards";

export type ListMyFamilyInvitesDeps = {
    isPermanentUser: () => Promise<boolean>;
    listMyFamilyInvites: () => Promise<MyFamilyInvite[]>;
};

/**
 * ログイン中の本登録ユーザーが、自分宛ての招待（家族名と期限）を確かめる。
 * @param deps 本登録の判定と照会
 * @returns 招待 ID、家族名、期限
 */
export async function listMyFamilyInvitesUsecase(
    deps: ListMyFamilyInvitesDeps,
): Promise<MyFamilyInvite[]> {
    await assertPermanentUser(deps);
    const invites = await deps.listMyFamilyInvites();
    return invites.map(({ id, familyName, expiresAt }) => ({
        id,
        familyName,
        expiresAt,
    }));
}
