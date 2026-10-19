# 家族の招待取り消し

## 仕様

家族のオーナーが、まだ使われていない招待を取り消せる。取り消した招待は承認できない。

## スコープ

### 含める

- オーナー（本登録ユーザー）による、未使用招待の取り消し

### 含めない

- 招待の発行（[create-family-invite.md](./create-family-invite.md)）
- 招待の一覧（[list-family-invites.md](./list-family-invites.md)）
- 承認（[join-family.md](./join-family.md)）
- 使用済み・期限切れの招待の取り消し

## 設計

### 各層の流れ

```text
family/page.tsx（一覧の各行）
  → cancelFamilyInviteAction
    → cancelFamilyInviteUsecase
      → cancel_family_invite（revoked_at のみ）
```

主なパス（新規）:

| 層 | パス | 役割 |
| --- | --- | --- |
| domain | `src/domain/repositories/family/family-invite-repository.ts` | 取り消しの契約 |
| infrastructure | `src/infrastructure/repositories/family/family-invite-repository-impl.ts` | `cancel_family_invite` の呼び出し |
| usecase | `src/usecase/family/cancel-family-invite-usecase.ts` | 取り消しの実行とエラーの意味づけ |
| app | `src/app/family/cancel-family-invite.action.ts` | `cancelFamilyInviteAction`。deps 組み立て |
| presentation | `src/presentation/components/family/` | 取り消しボタン（Secondary） |

### 決めたこと

- 取り消しは行を消さず、`revoked_at` を立てる。`approve_family_invite` は取り消し済みを無効として拒否する
- 取り消しは DB 関数 `cancel_family_invite`（`security definer`）だけが行う。変えてよい列は `revoked_at` のみ。クライアントの直 UPDATE はポリシー無しで通さない。`GRANT` / `search_path` は [family_invites.md](../../database/tables/family_invites.md)
- 使用済みの招待は取り消せない。失敗として扱い、所属は変えない
- オーナー確認は usecase と DB 関数の両方で行う。UI だけでは守らない
- ゲストは取り消せない（[ADR 007](../../../04_decisions/007-guest-login.md)）

## 関連

| 種類 | リンク |
| --- | --- |
| 要件定義 | [family-member-join.md](../../../01_requirements/family-member-join.md)（FR-05、FR-12） |
| ドメイン | [family.md](../../domain/family.md)（OP-04、INV-07） |
| テーブル | [family_invites.md](../../database/tables/family_invites.md) |
| 画面 | [family.md](../../ui/screens/family.md) |
| ADR | [011](../../../04_decisions/011-family-invite-link.md)、[007](../../../04_decisions/007-guest-login.md) |
