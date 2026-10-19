# 家族の招待一覧（オーナー）

## 仕様

家族のオーナーが、期限内で未使用の招待の一覧（宛先メール、期限）を家族管理画面で確かめられる。取り消し済み・期限切れ・承認済みは出ない。

## スコープ

### 含める

- オーナー（本登録ユーザー）による、自家族の有効な招待の一覧

### 含めない

- 招待の発行（[create-family-invite.md](./create-family-invite.md)）
- 取り消し（[cancel-family-invite.md](./cancel-family-invite.md)）
- 承認（[join-family.md](./join-family.md)）
- 自分宛ての招待（[list-my-family-invites.md](./list-my-family-invites.md)）
- 取り消し済み・期限切れ・承認済みの履歴

## 設計

### 各層の流れ

```text
family/page.tsx（オーナーのみ一覧を出す）
  → listFamilyInvitesUsecase
    → family_invites SELECT（未使用・未取り消し・期限内）
```

主なパス（新規）:

| 層 | パス | 役割 |
| --- | --- | --- |
| domain | `src/domain/repositories/family/family-invite-repository.ts` | オーナー一覧の契約 |
| infrastructure | `src/infrastructure/repositories/family/family-invite-repository-impl.ts` | SELECT と snake_case 変換 |
| usecase | `src/usecase/family/list-family-invites-usecase.ts` | オーナー確認、未使用・期限内に絞る |
| app | `src/app/family/page.tsx` | 一覧の表示。deps 組み立て |
| presentation | `src/presentation/components/family/` | 招待一覧（取り消しは別操作） |

### 決めたこと

- 返すのは招待 ID、宛先メール、期限（必要なら発行日時）（Q-02）
- オーナー確認は usecase と RLS の両方で行う。メンバーや未所属は読めない
- ゲストには出さない
- 宛先本人向けの家族名照会とは別操作。オーナー SELECT を宛先本人に使わせない

## 関連

| 種類 | リンク |
| --- | --- |
| 要件定義 | [family-member-join.md](../../../01_requirements/family-member-join.md)（FR-04、FR-12、NFR-05） |
| ドメイン | [family.md](../../domain/family.md)（Q-02、INV-07） |
| テーブル | [family_invites.md](../../database/tables/family_invites.md) |
| 画面 | [family.md](../../ui/screens/family.md) |
| ADR | [011](../../../04_decisions/011-family-invite-link.md)、[007](../../../04_decisions/007-guest-login.md) |
