# 家族グループ作成失敗（RLS SELECT ポリシーと作成フローの不整合）

## 概要

| 項目 | 内容 |
|---|---|
| 発生日 | 2026-06-22 |
| 症状 | 家族作成画面で「家族グループの作成に失敗しました。」と表示される |
| 影響範囲 | 家族グループ新規作成（`/family/new`） |
| 深刻度 | 高（作成機能が完全に使えない） |
| 修正 PR / マイグレーション | `20260622000001_families_select_owner_policy.sql` |

---

## 症状

- ログイン済みユーザーが `/family/new` から家族名を入力し「家族グループを作成する」を押すと、フォーム上に **「家族グループの作成に失敗しました。」** が表示される
- Server Action（`POST /family/new`）は HTTP 200 を返すが、リダイレクト（`/top`）されない
- ローカル Supabase・Next.js dev 環境で再現

---

## 根本原因

`families` テーブルの **SELECT RLS ポリシー** と、**アプリ側の作成フローの実行順序** が矛盾していた。

### 作成フロー（usecase）

`createFamilyUsecase` は次の順序で処理する。

1. `findFamilyByUserId` … 未所属か確認
2. `createFamily` … `families` に INSERT し、**`.select().single()` で作成行を取得**
3. `addFamilyMember` … `family_members` に作成者を INSERT

### 問題の RLS（修正前）

```sql
-- families SELECT（修正前）
using (id in (select get_my_family_ids()));
```

`get_my_family_ids()` は **`family_members` に自分の行がある `family_id` のみ** を返す。

そのため、ステップ 2 の時点では:

- `families` への INSERT は成功する（INSERT ポリシー: 認証済みユーザー OK）
- 直後の `.select().single()` は **RLS により 0 行** となり失敗する
- ステップ 3 の `addFamilyMember` まで到達しない

```
INSERT families  → OK
SELECT families  → NG（まだ family_members 未登録のため）
addFamilyMember  → 未実行
```

### ユーザー向けメッセージが汎用文言になった理由

`createFamilyAction` のエラーハンドリングで、Supabase から返るエラーオブジェクトが `instanceof Error` にならないケースがあり、**汎用メッセージ `FAMILY_CREATE_FAILED`**（「家族グループの作成に失敗しました。」）にフォールバックしていた。結果として、画面上は原因が分かりにくい文言だけが表示された。

---

## 修正内容

### 1. RLS ポリシーの更新（本修正）

マイグレーション `20260622000001_families_select_owner_policy.sql` にて、`families` の SELECT 条件に **`owner_id = auth.uid()`** を追加した。

```sql
using (
  id in (select get_my_family_ids())
  or owner_id = auth.uid()
);
```

これにより、**`family_members` 登録前でも、作成直後のオーナーが自分の家族行を SELECT できる**。

### 2. エラーメッセージの改善（副次対応）

`create-family.action.ts` の `mapCreateFamilyError` で、`message` プロパティを持つオブジェクトからもメッセージを抽出するようにした。今後、別種の DB エラーが起きた場合に原因が画面に出やすくなる。

### 3. ドキュメント更新

`docs/tables/family/families.md` の SELECT ポリシー説明を修正後の条件に合わせて更新した。

---

## 再発防止

| 観点 | 対策 |
|---|---|
| **RLS 設計** | INSERT 後に `.select()` する操作では、「INSERT 直後・関連行未作成」の状態でも SELECT が通るかを必ず確認する |
| **作成フロー** | `families` INSERT と `family_members` INSERT が分離している場合、中間状態で必要な RLS を洗い出す |
| **E2E / 手動確認** | 家族作成は DB 書き込み + RLS の組み合わせ確認が必須。マイグレーション追加後はローカルで作成フローを一度通す |
| **エラー表示** | Server Action では Supabase エラーの型を想定し、開発時はログまたは詳細メッセージで原因を追えるようにする |

---

## 関連ファイル

| 種別 | パス |
|---|---|
| マイグレーション（修正） | `supabase/migrations/20260622000001_families_select_owner_policy.sql` |
| 当初の families RLS | `supabase/migrations/20260307000002_create_family_tables.sql` |
| リポジトリ（INSERT + SELECT） | `src/infrastructure/repositories/family/family-repository-impl.ts` |
| ユースケース（作成順序） | `src/usecase/family/create-family-usecase.ts` |
| Server Action | `src/app/family/new/create-family.action.ts` |
| テーブル定義ドキュメント | `docs/tables/family/families.md` |
| ADR | `docs/adr/05-family-feature.md` |

---

## ローカル環境での確認手順

1. マイグレーション適用

```bash
npx supabase db push --local
```

2. 開発サーバー起動後、ログインして `/family/new` から家族を作成
3. `/top` にリダイレクトされ、`families` と `family_members` にそれぞれ 1 行追加されていることを Supabase Studio 等で確認

---

## 補足（リモート環境）

本番・ステージングなどリモート Supabase を利用している場合も、同マイグレーションの適用が必要。

```bash
npx supabase db push
```
