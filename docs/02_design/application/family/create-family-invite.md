# 家族の招待発行

## 仕様

家族のオーナーが、招待したい人のメールアドレスを指定して、家族への招待を 1 件発行できる。1 件は 1 人宛て。案内の URL（`/family`）をコピーして、LINE などで相手に渡せる。アプリはメールを送らない。

## スコープ

### 含める

- オーナー（本登録ユーザー）による、宛先メール指定の招待発行
- 発行後の、案内 URL の表示とコピー
- 同じ宛先への、期限内未使用の重ね発行の拒否

### 含めない

- 承認（[join-family.md](./join-family.md)）
- 発行済み招待の一覧（[list-family-invites.md](./list-family-invites.md)）
- 取り消し（[cancel-family-invite.md](./cancel-family-invite.md)）
- オーナー以外の発行、アプリからのメール送信、参加コード、秘密のトークン

## 設計

### 各層の流れ

```text
family/page.tsx（オーナーのみフォームを出す）
  → createFamilyInviteAction
    → createFamilyInviteUsecase
      → create_family_invite（検証と INSERT を 1 トランザクション）
```

主なパス（新規）:

| 層 | パス | 役割 |
| --- | --- | --- |
| domain | `src/domain/models/family/family-invite.ts` | 招待の型 |
| domain | `src/domain/repositories/family/family-invite-repository.ts` | 発行の契約 |
| infrastructure | `src/infrastructure/repositories/family/family-invite-repository-impl.ts` | `create_family_invite` の呼び出し |
| usecase | `src/usecase/family/create-family-invite-usecase.ts` | 発行の実行とエラーの意味づけ |
| app | `src/app/family/create-family-invite.action.ts` | `createFamilyInviteAction`。deps 組み立て |
| presentation | `src/presentation/components/family/` | 宛先入力と、案内 URL のコピー |

### 決めたこと

- 秘密のトークンは作らない。案内 URL は常に `/family`（[ADR 011](../../../04_decisions/011-family-invite-link.md)）
- 有効期限は発行から 1 日（FR-06）。変更しやすいよう定数にする
- 宛先は trim のうえ小文字で保存・比較する
- 宛先が `auth.users` に既にあるかは照会しない。発行の成否で登録済みかどうかをオーナーに悟らせない（NFR-04）
- 同じ家族・同じ正規化メールで、未使用・未取り消し・`expires_at > now()` の行があるときは拒否（FR-15）。取り消し済み・期限切れ・承認済みは妨げない
- 発行は DB 関数 `create_family_invite`（`security definer`）が行う。関数内で家族行を `FOR UPDATE` してから照会・INSERT する。クライアントの直 INSERT は RLS ポリシー無しで通さない。`GRANT` / `search_path` は [family_invites.md](../../database/tables/family_invites.md)
- オーナー確認とゲスト確認は usecase と DB 関数の両方で行う。UI だけでは守らない
- ゲスト判定のため、`is_permanent_user()` を DB に追加する（ADR 007 の JWT `is_anonymous`）

## 関連

| 種類 | リンク |
| --- | --- |
| 要件定義 | [family-member-join.md](../../../01_requirements/family-member-join.md)（FR-01、FR-02、FR-03、FR-06、FR-12、FR-14、FR-15、NFR-04） |
| ドメイン | [family.md](../../domain/family.md)（OP-02、INV-06、INV-09） |
| テーブル | [family_invites.md](../../database/tables/family_invites.md) |
| 画面 | [family.md](../../ui/screens/family.md) |
| ADR | [011](../../../04_decisions/011-family-invite-link.md)、[007](../../../04_decisions/007-guest-login.md) |
