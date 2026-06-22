# ADR 006: RLS ヘルパー関数（`security definer`）の採用

## 背景

家族機能では `family_members` テーブルが「同じ家族かどうか」の判定根拠になる。
このテーブル自体にも RLS をかける必要があるが、**RLS ポリシーが同じテーブルを参照すると無限再帰**が発生するという PostgreSQL の構造的な制約がある。

また、レシピ共有では `recipes` やその子テーブル（材料・手順・カテゴリ）の RLS からも家族判定が必要になる。
ポリシーごとに同じ条件を重複記述すると、変更時の不整合やレビュー負荷が増える。

本 ADR は、**なぜ `get_my_family_ids()` / `is_same_family()` といった RLS ヘルパー関数を採用したか**、および**採用しなかった代替案**を記録する。

関連: [ADR 005: 家族機能](./05-family-feature.md)

---

## 問題：RLS ポリシーの自己参照による無限再帰

`family_members` の SELECT ポリシーを素直に書くと、次のようになる。

```sql
-- NG: 自テーブルを参照するため無限再帰が発生する
create policy "members can see family members"
  on family_members for select
  using (
    exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = auth.uid()
    )
  );
```

このポリシーを評価するたびに `family_members` への SELECT が走り、その SELECT でも RLS が発動して同じポリシーを再評価しようとする。

```
① family_members を SELECT → RLS 発動 → ポリシー評価開始
② ポリシーが family_members を SELECT → RLS 発動 → ポリシー評価開始
③ ポリシーが family_members を SELECT → RLS 発動 → ポリシー評価開始
④ ∞（エラー）
```

これは実装ミスではなく、**「RLS 付きテーブルをポリシー条件内で読む」構造**に起因する問題である。

---

## 決定内容

家族関連の RLS 判定には、次の **`security definer` ヘルパー関数**を採用する。

| 関数 | 戻り値 | 用途 |
|---|---|---|
| `get_my_family_ids()` | 自分が所属する `family_id` の集合 | `families` / `family_members` の RLS |
| `is_same_family(p_user_id)` | boolean | `recipes` 等での「指定ユーザーと自分が同じ家族か」判定 |

加えて、子テーブルの RLS 再利用には **`accessible_recipe_ids` ビュー**（`security_invoker = true`）を併用する（後述）。

定義はマイグレーション `20260307000002_create_family_tables.sql` にある。

---

## 採用した設計と理由

### 1. `security definer` 関数を「判定材料の取得窓口」として使う

```sql
create or replace function get_my_family_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select family_id
  from family_members
  where user_id = auth.uid();
$$;

create policy "members can select family members"
  on family_members for select
  using (family_id in (select get_my_family_ids()));
```

**理由**

- `security definer` 関数は**関数定義者の権限**で実行されるため、関数内の `family_members` 読み取りでは RLS がバイパスされ、再帰が止まる
- ポリシー本体は「返ってきた `family_id` に含まれる行だけ許可」という**単純な比較**に留まる
- 最終的な行の許可・拒否は依然として RLS ポリシーが行う。**RLS 全体が無効になるわけではない**

実際の動作フロー：

```
① ユーザーが family_members を SELECT
② RLS 発動 → ポリシー評価開始
③ get_my_family_ids() を呼ぶ（関数内は RLS バイパス → 再帰しない）
    → user_id = auth.uid() の family_id 一覧を返す
④ ポリシーが「その family_id の行のみ許可」と判定
⑤ 許可された行だけ返る
```

---

### 2. `is_same_family()` で他テーブルからの家族判定を共通化

```sql
create or replace function is_same_family(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from family_members fm_a
    where fm_a.user_id = p_user_id
      and exists (
        select 1
        from family_members fm_b
        where fm_b.family_id = fm_a.family_id
          and fm_b.user_id = auth.uid()
      )
  );
$$;
```

**理由**

- `recipes` の UPDATE / DELETE ポリシーなど、**別テーブルから家族判定が必要な箇所**で同じロジックを再利用できる
- 関数内で `family_members` を読むため、こちらも `security definer` が必要（呼び出し元テーブルの RLS とは別問題だが、一貫した窓口として同パターンを使う）
- nested `EXISTS` により、ユーザーが複数家族に所属している場合でも**最初のマッチで短絡評価**できる

利用例（`recipes` の UPDATE ポリシー）：

```sql
create policy "family members can update published recipes"
  on recipes for update
  using (
    is_draft = false
    and is_same_family(author_id)
  );
```

---

### 3. `set search_path = public, pg_temp` を必須とする

**理由**

- `security definer` 関数は権限昇格の入口になりうるため、**Schema Poisoning**（同名オブジェクトを別スキーマに置いて関数の参照先をすり替える攻撃）への対策が必要
- Supabase / PostgreSQL のベストプラクティスとして `search_path` を固定する

---

### 4. `stable` を付与する

**理由**

- 同一トランザクション・同一引数で結果が変わらない関数であることをプランナーに伝える
- RLS 評価がクエリごとに何度も走るため、最適化のヒントとして有効

---

### 5. 子テーブルは `accessible_recipe_ids` ビューで RLS を再利用（ヘルパー関数の補完）

`recipe_ingredients` 等の子テーブルでは、`is_same_family()` を直接書かず **`accessible_recipe_ids` ビュー**経由で親 `recipes` の RLS を再利用する。

```sql
create or replace view accessible_recipe_ids
  with (security_invoker = true)
as
  select id from recipes;

create policy "users can select accessible recipe ingredients"
  on recipe_ingredients for select
  using (
    exists (select 1 from accessible_recipe_ids where id = recipe_ingredients.recipe_id)
  );
```

**理由**

- 子テーブルごとに `is_draft` + `is_same_family()` を重複記述する必要がなくなる（レビュー指摘 I-2 対応）
- `recipes` の RLS を変更すれば、ビュー経由の子テーブルも自動的に追従する
- `security_invoker = true` により、ビュー実行時に**クエリユーザーの権限**で `recipes` が読まれ、RLS が正しく適用される

> **注意**: ビューのデフォルトは `SECURITY DEFINER`（作成者権限）であり、このままだと `recipes` の RLS がスキップされ全レシピ ID が見える。**`security_invoker = true` は必須**。

関連: [`docs/tables/view/accessible_recipe_ids.md`](../../tables/view/accessible_recipe_ids.md)

---

### 6. `recipes` の SELECT は EXISTS + JOIN、`UPDATE` / `DELETE` は `is_same_family()`

マイグレーションでは、`recipes` の SELECT ポリシーだけ inline の EXISTS + JOIN を使い、UPDATE / DELETE は `is_same_family(author_id)` を使っている。

**理由**

- SELECT は一覧取得で行数が多く、プランナーが `author_id` インデックスを活用できる JOIN 形が有利な場合がある
- UPDATE / DELETE は単一行操作のため `is_same_family()` の呼び出しコストは問題にならない
- 判定ロジックの意味は同じだが、**操作種別ごとにパフォーマンスを最適化**している

---

## 採用しなかった代替案

### 1. ポリシー内で `family_members` を直接サブクエリ参照

**理由**

- 上記の無限再帰が発生し、実装不可能

---

### 2. `family_members` の RLS を無効化する

**理由**

- 他家族のメンバー一覧が丸見えになる
- Closed Environment の根幹（家族単位のデータ分離）が崩れる
- アプリ層だけで遮断するのは、サービスロール誤用・バイパス経路への備えが弱い

---

### 3. `security invoker` 関数のみで再帰を解決する

`security invoker`（デフォルト）関数は呼び出し元の権限で実行されるため、関数内でも RLS が適用される。

**理由**

- 関数内の `family_members` 読み取りでも RLS が走り、**再帰問題は解消しない**
- 再帰を止めるには、判定材料取得の一段だけ RLS をバイパスする必要がある

---

### 4. RLS を使わずアプリ層のみでアクセス制御する

**理由**

- Supabase クライアントは anon / authenticated キーで DB に直接アクセスするため、DB 層の防御が必須
- ADR 002 で「RLS + ドメイン層の二重防御」を採用済み
- アプリのバグや将来の別クライアントからの接続を想定すると、RLS なしはリスクが高い

---

### 5. 子テーブルのポリシーに `is_same_family()` を毎回直書きする

**理由**

- `is_draft` 条件と組み合わせた重複が増え、変更時に不整合が起きやすい
- `accessible_recipe_ids` ビューで親 RLS に委譲する方が、定義が 1 か所に集約される（I-2 対応）

---

### 6. `recipes` に `family_id` を持たせて JOIN を避ける

**理由**

- レシピ作成時の設定ミス・家族変更時の不整合リスクがある
- `author_id` + `family_members` で判定する方が、作成者と所属の現時点状態で正しく共有範囲を表現できる
- 詳細は ADR 005 を参照

---

## 結果・利点

- `family_members` の RLS を安全に実装できる（再帰エラーを回避）
- 家族判定ロジックが関数・ビューに集約され、ポリシーが読みやすくなる
- `recipes` の RLS 変更が子テーブルに自動追従する
- Supabase 公式が推奨する RLS パターンと整合する

---

## 考慮点・トレードオフ

| 項目 | 内容 |
|---|---|
| `security definer` の権限昇格リスク | `search_path` 固定・関数の責務を「判定材料取得」に限定して緩和。レビュー時は必ず確認する |
| デバッグの難しさ | ポリシー評価が関数経由になるため、エラー時は「どの関数・どのポリシーか」を意識する必要がある |
| テスト | RLS + 関数の組み合わせは単体テストでは検証しにくい。マイグレーション適用後の DB 統合テストまたは E2E が有効 |
| 関数と inline JOIN の二系統 | `recipes` SELECT だけ別形式のため、変更時は両方の整合を確認する |

---

## 関連ドキュメント

- [テーブル定義: family_members（RLS 詳説）](../../tables/family/family_members.md)
- [ビュー定義: accessible_recipe_ids](../../tables/view/accessible_recipe_ids.md)
- [マイグレーション: 家族テーブル](../../supabase/migrations/20260307000002_create_family_tables.sql)
- [マイグレーション: レシピテーブル](../../supabase/migrations/20260307000003_create_recipe_tables.sql)
- [ADR 002: Supabase](./02-Supabase.md)
- [ADR 005: 家族機能](./05-family-feature.md)
