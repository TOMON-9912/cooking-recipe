# ADR 016: 家族作成は本人がオーナーの1件に限る

## 背景

ログイン済みなら、`families` へ直接 INSERT でき、`owner_id` は本人でなくてもよかった。所属の確認はアプリだけが行い、同時に 2 件作ると両方残る。すでに家族へ所属している人も、別の家族を作れた。

要件は [family-create-single.md](../01_requirements/family-create-single.md) の FR-01〜FR-06。

## 決定内容

- 家族の作成は `create_family(p_name text)` だけが行う。`security definer`、`set search_path = public, pg_temp`。`GRANT EXECUTE` は `authenticated` のみ
- 関数は `auth.uid()` をオーナーにし、家族行と最初の所属を 1 トランザクションで入れる。オーナーを引数にしない
- 先にユーザー単位のアドバイザリロックを取る。キーは `approve_family_invite` と同じ `hashtextextended(auth.uid()::text, 0)`。そのあと所属が無ければ作成する
- `family_members.user_id` に一意制約を付ける。ロックを同時に抜けた 2 件目の所属を拒む
- `families` と `family_members` に INSERT ポリシーは無い
- ゲストも 1 件作れる。`is_permanent_user()` は見ない（FR-05）。招待の発行条件は変えない
- 空の名前は、これまでどおりアプリが拒む。要件に無い検査は関数へ足さない

## なぜこの案か

| 案 | 採否 | 理由 |
| --- | --- | --- |
| 検証付き関数 + 所属の一意制約 | 採用 | オーナーは常に本人になる（FR-03）。画面を介さない呼び出しでも同じになる（FR-04）。作成と承認が同時でも 1 人 1 家族で閉じる（FR-02、FR-06） |
| INSERT の RLS だけでオーナーを本人に限る | 不採用 | 同時の 2 件が、所属の確認より先に両方入る。所属済みの人が別の家族を作ることも止まらない |
| `families.owner_id` だけを一意にする | 不採用 | オーナーでない所属者が、別の家族を作れる |
| 一意制約を付けず、関数内の確認だけにする | 不採用 | [ADR 005](./005-family-feature.md) は、スキーマを多対多のまま残し、将来の複数家族で表を変えなくてよいようにしている。今回の要件は 1 人 1 家族であり、同時実行の最終的な閉じに制約が要る |
| 家族と所属をアプリから 2 回に分けて入れる | 不採用 | 2 回目が失敗すると、所属の無い家族が残る。途中でオーナーをすり替えられる |

## 結果・利点

- 作成できるのは、未所属のログインユーザーが、自分をオーナーにして 1 件だけ
- 招待の承認は `approve_family_invite` のまま。同じユーザーロックを共有するので、承認の直前に作成されても二重所属にならない
- 脱退して所属が無くなれば、再び作成できる。脱退で残る `owner_id` の扱いは変えない

## 考慮点

- `user_id` の一意は、[ADR 005](./005-family-feature.md) が残していた「将来の複数家族でも表を変えない」を狭める。複数家族に戻すときは、この制約と関数の確認を一緒に外す
- [ADR 011](./011-family-invite-link.md) の「最初のメンバーは直接 INSERT」は、この ADR で置き換える
- ドメイン仕様 `family.md` の「`user_id` に一意制約は付けない」は、この決定と食い違う。仕様文書の書き換えは ADR 014 の対象外なので、この設計では直さない

## 関連

- [family-create-single.md](../01_requirements/family-create-single.md)
- [families.md](../02_design/database/tables/families.md)
- [family_members.md](../02_design/database/tables/family_members.md)
- [005-family-feature.md](./005-family-feature.md)
- [006-rls-helper-functions.md](./006-rls-helper-functions.md)
- [011-family-invite-link.md](./011-family-invite-link.md)
