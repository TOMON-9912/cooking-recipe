# テストレビュー: 家族招待

| 項目 | 内容 |
| --- | --- |
| 対象 | 未コミットの `src/usecase/family/*invite*.test.ts`、`e2e/family-invite.spec.ts` |
| ブランチ | `docs/44-test-design-family-member-join` |
| レビュー日時 | 2026-10-19 23:14 JST |
| 実装 Issue | 未作成 |

実装の指摘は [family-invite-implementation-20261019-2314.md](./family-invite-implementation-20261019-2314.md)。

## 総合

| 観点 | 所見 |
| --- | --- |
| モック | ゲスト拒否、宛先の小文字化、一覧の期限境界、既所属で承認しないことは見ている |
| 実 DB | `src/**/*.db.test.ts` が無い。RLS と DB 関数は未検証 |
| e2e | 未ログインの承認画面と、ログイン後にそこへ戻らないことだけ |
| 断言の強さ | deps が投げた失敗コードを、そのまま期待しているテストがある |

## 良い点

- 発行前にメールを `guest@example.com` へ揃えることを、呼び出し引数で見ている
- オーナーでない人とゲストでは、発行・一覧・取り消しの deps を呼ばない
- 期限が現在時刻と同じ招待は、一覧に残さない
- 既に家族がある人は `approveFamilyInvite` を呼ばない
- 未ログインの `/family/join` はログイン画面へ行き、参加ボタンが無い

## 指摘一覧

| # | 題 | 重要度 | 状態 |
| --- | --- | --- | --- |
| 1 | 実 DB のテストが無い | 高 | 未対応 |
| 2 | 失敗コードの再送を、ルールの検証にしている | 中 | 未対応 |
| 3 | e2e が承認画面の入口だけ | 中 | 未対応 |

## 改善点

### 1. 実 DB のテストが無い（重要度: 高）

- 状態: 未対応
- 現状: Vitest は usecase の deps モックだけである。`pg` は `package.json` に足してあるが、`*.db.test.ts` は無い
- 改善案: ローカル DB に対し、直 INSERT / UPDATE の拒否、発行から 1 日の `expires_at`、宛先メールの一致、人数 6、同時承認で所属が 1 件だけ増えることを `src/**/*.db.test.ts` で見る
- 理由: モックが通っても、RLS と関数の中の関門は分からない
- 正本の根拠: `docs/03_test/strategy.md`、`docs/02_design/database/tables/family_invites.md`、`docs/01_requirements/family-member-join.md`（FR-06、FR-16、NFR-01）
- 対応: なし

### 2. 失敗コードの再送を、ルールの検証にしている（重要度: 中）

- 状態: 未対応
- 現状: 重ね発行、使用済みの取り消し、期限切れ・人数上限・宛先違いは、deps が `Error(code)` を返すと usecase が同じ message を投げる、という形である。usecase 自身はその条件を計算しない
- 改善案: その条件は実 DB のテストで、関数が拒否し、所属や `revoked_at` が増えないことを見る。モック側は、deps を呼ばない分岐（ゲスト、オーナー以外、既所属）に寄せる
- 理由: deps が正しいコードを投げる前提のテストは、要件の拒否を検証していない
- 正本の根拠: `docs/01_requirements/family-member-join.md`（FR-05、FR-10、FR-15、FR-16）、`src/usecase/family/join-family-usecase.test.ts`
- 対応: なし

### 3. e2e が承認画面の入口だけ（重要度: 中）

- 状態: 未対応
- 現状: `e2e/family-invite.spec.ts` は、未ログインのリダイレクトと、ログイン後に `/family/join` へ戻らないことだけである。戻らない方は、資格情報が無いと skip される
- 改善案: 画面ができてから、オーナーの発行と案内 URL、宛先本人の承認、ゲストに発行フォームと参加ボタンが無いことを足す
- 理由: いまの 2 件は FR-13 の入口までである。発行、一覧、取り消し、参加のクリティカルパスは画面をまたいで見ていない
- 正本の根拠: `docs/02_design/ui/screens/family.md`、`docs/02_design/ui/screens/family-join.md`、`docs/03_test/strategy.md`
- 対応: なし
