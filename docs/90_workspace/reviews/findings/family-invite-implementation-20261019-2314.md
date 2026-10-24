# 実装レビュー: 家族招待の usecase

| 項目 | 内容 |
| --- | --- |
| 対象 | 未コミットの `src/usecase/family/*invite*`、`src/domain/models/family/family-invite.ts` |
| ブランチ | `docs/44-test-design-family-member-join` |
| レビュー日時 | 2026-10-19 23:14 JST |
| 実装 Issue | 未作成 |

テストの指摘は [family-invite-tests-20261019-2314.md](./family-invite-tests-20261019-2314.md)。

## 総合

| 観点 | 所見 |
| --- | --- |
| アーキテクチャ | usecase は infrastructure を import していない。deps で発行・一覧・取り消し・承認を分けている |
| 要件の到達 | 発行、取り消し、承認、自分宛ての一覧は DB 関数と画面までつながっている |
| セキュリティ | 本登録とオーナーの関門は DB 関数にある。usecase の boolean は画面に出す前の分岐 |
| 未実装 | 取り消しの e2e は無い。ログイン後に承認画面へ戻らない確認は、資格情報が無いと skip される |

## 良い点

- 発行、一覧、自分宛て照会、取り消し、承認が別関数になっている
- 宛先は trim して小文字にしてから deps に渡す
- ゲストとオーナー以外は、発行・一覧・取り消しの deps を呼ばない
- 自分宛ての戻りは招待 ID、家族名、期限だけにマップしている
- 既存の `createFamilyUsecase` と同じく、失敗は `Error` の message にコードを載せている

## 指摘一覧

| # | 題 | 重要度 | 状態 |
| --- | --- | --- | --- |
| 1 | 認可が呼び出し側の boolean だけ | 高 | 対応済み |
| 2 | 期限 1 日と DB の関門が無い | 高 | 対応済み |
| 3 | 既所属の確認が承認の外にある | 中 | 対応済み |

## 改善点

### 1. 認可が呼び出し側の boolean だけ（重要度: 高）

- 状態: 対応済み
- 現状: `isPermanentUser` と `isOwnerOfFamily` は deps が `boolean` を返す。Action も DB 関数も無い。渡す側が `true` を返せば、usecase は発行・取り消し・承認へ進む
- 改善案: 本登録とオーナーの判定を、DB 関数（`is_permanent_user`、`create_family_invite`、`cancel_family_invite`、`approve_family_invite`）の中に置く。usecase の boolean は、その結果を扱う層に留める
- 理由: 要件は、オーナー以外とゲストが発行・承認できないこと、家族 ID だけでは入れないことを求めている。boolean を信用する層だけでは満たせない
- 正本の根拠: `docs/01_requirements/family-member-join.md`（FR-12、FR-14、NFR-01）、`docs/02_design/database/tables/family_invites.md`
- 対応: 2026-10-19。`is_permanent_user` と発行・取り消し・承認の関数が、JWT と `families.owner_id` で拒否する。usecase の boolean は画面に出す前の分岐に留めた

### 2. 期限 1 日と DB の関門が無い（重要度: 高）

- 状態: 対応済み
- 現状: `createFamilyInviteUsecase` は正規化したメールを渡すだけである。`expires_at` を発行から 1 日にする処理、直 INSERT / UPDATE の拒否、人数上限、メール確認済みの確認は、この変更に無い
- 改善案: `family_invites` と、設計にある関数・RLS をマイグレーションで置く。期限は関数の中で発行時刻から 1 日にする
- 理由: 一覧の絞り込みは usecase にあるが、行を作る期限と、関数を通らない更新の拒否は DB 側の要件である
- 正本の根拠: `docs/01_requirements/family-member-join.md`（FR-06、FR-16）、`docs/02_design/database/tables/family_invites.md`、`docs/02_design/database/tables/family_members.md`
- 対応: 2026-10-19。`supabase/migrations/20261019000001_family_invites.sql` にテーブル、RLS、`family_member_limit`、発行から 1 日の `create_family_invite` を置いた。`family_members` の INSERT はオーナー本人の初回所属だけにした

### 3. 既所属の確認が承認の外にある（重要度: 中）

- 状態: 対応済み
- 現状: `joinFamilyUsecase` は `findFamilyByUserId` のあと、別の呼び出しで `approveFamilyInvite` する。同じトランザクションではない
- 改善案: 既所属、人数上限、宛先メールの一致、使用済み化は `approve_family_invite` の 1 回にまとめる。usecase はその失敗コードを返す
- 理由: 所属が無いことを見てから承認するまでの間に、もう一つの承認が通ると、二重所属や人数超過が起きうる
- 正本の根拠: `docs/02_design/application/family/join-family.md`、`docs/02_design/domain/family.md`（INV-01、INV-08、INV-10）
- 対応: 2026-10-19。`joinFamilyUsecase` は承認の前に所属を見ない。既所属、人数上限、宛先、使用済み化は `approve_family_invite` が同じトランザクションで行う
