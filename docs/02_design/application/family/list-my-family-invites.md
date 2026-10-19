# 自分宛ての招待照会

## 仕様

宛先のメールアドレスでログインした本登録ユーザーが、自分宛ての未使用招待（家族名）を確かめられる。承認前に、メンバーやレシピは見えない。

## スコープ

### 含める

- ログイン中ユーザーのメールに一致する、期限内未使用・未取り消しの招待
- 返すもの: 招待 ID、家族名、期限

### 含めない

- 承認（[join-family.md](./join-family.md)）
- オーナーの招待一覧（[list-family-invites.md](./list-family-invites.md)）
- メンバー一覧、レシピ、オーナー名

## 設計

### 各層の流れ

```text
family/page.tsx および family/join/page.tsx
  → listMyFamilyInvitesUsecase
    → list_my_family_invites（宛先メールと auth.users.email の一致）
```

主なパス（新規）:

| 層 | パス | 役割 |
| --- | --- | --- |
| domain | `src/domain/repositories/family/family-invite-repository.ts` | 自分宛て照会の契約 |
| infrastructure | `src/infrastructure/repositories/family/family-invite-repository-impl.ts` | `list_my_family_invites` の呼び出し |
| usecase | `src/usecase/family/list-my-family-invites-usecase.ts` | 本登録確認。空配列は「招待が無い」 |
| app | `src/app/family/page.tsx`、`src/app/family/join/page.tsx` | 家族管理での確認と、承認画面の家族名 |

### 決めたこと

- `family_invites` を宛先本人が直接 SELECT しない。`list_my_family_invites()`（`security definer`）が、`lower(invited_email) = lower(auth.users.email)`（`id = auth.uid()`）かつ未使用・未取り消し・期限内の行だけを見る。JWT の email クレームは正にしない
- 所属の有無は問わない。既に家族に入っていても、自分宛ての未使用招待は返す（承認は OP-03 が拒否する）
- 戻り値は招待 ID、家族名、期限だけ。家族 ID・メンバー・オーナー名・他の招待の宛先は返さない（NFR-03、NFR-05）
- 一致する行が無いときは空。他人の招待の有無は分からない
- ゲストには出さない
- `GRANT` / `search_path` は [family_invites.md](../../database/tables/family_invites.md)

## 関連

| 種類 | リンク |
| --- | --- |
| 要件定義 | [family-member-join.md](../../../01_requirements/family-member-join.md)（FR-07、NFR-03、NFR-05） |
| ドメイン | [family.md](../../domain/family.md)（Q-03） |
| テーブル | [family_invites.md](../../database/tables/family_invites.md) |
| 画面 | [family.md](../../ui/screens/family.md)、[family-join.md](../../ui/screens/family-join.md) |
| ADR | [011](../../../04_decisions/011-family-invite-link.md)、[007](../../../04_decisions/007-guest-login.md) |
