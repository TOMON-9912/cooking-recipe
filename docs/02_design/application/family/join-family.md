# 招待を承認して家族に参加する

## 仕様

自分宛ての招待がある未所属の本登録ユーザーが、承認画面で家族名を確かめたうえで承認し、その家族のメンバーになれる。家族 ID や案内 URL だけでは参加できない。

## スコープ

### 含める

- 自分宛ての有効な招待についての、家族名の確認と承認
- 参加の実行（所属の追加と、招待の使用済み化）
- `family_members` の直接 INSERT を、オーナー本人の追加だけに絞る
- 二重所属と人数上限（6 人）の、同時承認での超過防止

### 含めない

- 招待の発行（[create-family-invite.md](./create-family-invite.md)）
- オーナーの招待一覧（[list-family-invites.md](./list-family-invites.md)）
- 自分宛ての招待の照会（[list-my-family-invites.md](./list-my-family-invites.md)）
- 取り消し（[cancel-family-invite.md](./cancel-family-invite.md)）
- 脱退、複数家族、メンバーの強制追加・削除
- ゲストの本登録（Identity Linking）
- ログイン後に承認画面へ自動で戻る処理

## 設計

### 各層の流れ

```text
family/join/page.tsx
  → listMyFamilyInvitesUsecase（家族名。Q-03）
  → joinFamilyAction
    → joinFamilyUsecase
      → approve_family_invite（検証と所属追加を 1 トランザクション）
```

主なパス（新規）:

| 層 | パス | 役割 |
| --- | --- | --- |
| domain | `src/domain/repositories/family/family-invite-repository.ts` | 承認の契約 |
| infrastructure | `src/infrastructure/repositories/family/family-invite-repository-impl.ts` | `approve_family_invite` の呼び出し |
| usecase | `src/usecase/family/join-family-usecase.ts` | 承認の実行とエラーの意味づけ |
| app | `src/app/family/join/page.tsx`、`join-family.action.ts` | 画面と `joinFamilyAction`（page は未作成。新規） |
| presentation | `src/presentation/components/family/` | 承認の確認 UI |
| DB | `supabase/migrations/` | `family_invites`、`is_permanent_user()`、`family_member_limit()`、`approve_family_invite`、`family_members` の INSERT ポリシー変更 |

### 決めたこと

- 参加は DB 関数 `approve_family_invite`（`security definer`、引数は `invite_id`）が行う。検証・所属追加・使用済み化を 1 トランザクションにまとめる。クライアントから `family_members` を直接 INSERT させない（[ADR 011](../../../04_decisions/011-family-invite-link.md)）。`GRANT` / `search_path` は [family_invites.md](../../database/tables/family_invites.md)
- 関数内で確認するもの: ログイン済み、`is_permanent_user()`、`auth.users.email_confirmed_at` が NULL でない、未所属、招待が存在し未使用・未取り消し・期限内、`lower(invited_email) = lower((select email from auth.users where id = auth.uid()))`、対象家族の人数が `family_member_limit()` 未満
- メール比較の正は `auth.users.email`（確認済みの登録メール）。JWT の email クレームだけに頼らない
- メール確認は登録時の仕組みを使う。新しい確認は足さない。承認時は DB 関数でも同じ行の `email_confirmed_at` を見る
- `user_id` の一意制約は付けない。二重所属と人数超過は、関数内で直列化して拒否する（家族行を `FOR UPDATE`、承認するユーザーにはトランザクション advisory lock）。INV-01 / INV-08 / 指摘 6
- 同じ招待の同時承認は、招待行を先にロックして使用済みにする。成立するのは 1 人
- 失敗の意味づけは usecase が行う。自分宛ての期限切れ・取り消し済み・承認済みは理由を分けて返す（FR-10）。招待が無い・他人宛て（メール不一致）は同じ「使えない」にする（NFR-05）。人数上限・既所属・ゲスト・未確認はそれぞれの文
- 既存の家族作成（[create-family.md](./create-family.md)）は、オーナー本人の追加として直接 INSERT を使い続ける。変更後のポリシー（自分がオーナーの家族に、自分を追加）を満たす

### 影響を受ける既存の仕様

| 既存 | 影響 |
| --- | --- |
| `family_members` の INSERT ポリシー | 絞る。create-family の経路は維持する |
| `FamilyMemberRepository.add` のコメント（招待リンク経由の参加時に使用） | 参加は `approve_family_invite` を使うため、コメントを実態に合わせる |

## 関連

| 種類 | リンク |
| --- | --- |
| 要件定義 | [family-member-join.md](../../../01_requirements/family-member-join.md)（FR-08〜FR-11、FR-13、FR-14、FR-16、NFR-01、NFR-02、NFR-05、NFR-06、NFR-07） |
| ドメイン | [family.md](../../domain/family.md)（OP-03、INV-01、INV-04、INV-05、INV-08、INV-10） |
| テーブル | [family_invites.md](../../database/tables/family_invites.md)、[family_members.md](../../database/tables/family_members.md) |
| 画面 | [family-join.md](../../ui/screens/family-join.md) |
| ADR | [011](../../../04_decisions/011-family-invite-link.md)、[007](../../../04_decisions/007-guest-login.md)、[005](../../../04_decisions/005-family-feature.md) |
