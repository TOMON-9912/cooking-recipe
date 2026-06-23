# ADR 005: 家族機能

## 背景

食卓手帖は「家族の味を、ここに残そう」というコンセプトのもと、**家族単位で閉じた空間**でレシピを共有・継承するアプリである。

家族機能は以下を満たす必要がある。

- 他家族のデータへのアクセスを完全に遮断する（センシティブな内容の保存を想定）
- レシピは個人の所有物ではなく家族の資産として扱う
- 招待した家族メンバーが継続的にアクセスできる
- Supabase RLS とクリーンアーキテクチャの両方と整合する

本 ADR は、家族機能の仕様について**採用した設計**と**採用しなかった設計**、およびその理由を記録する。

---

## 決定内容（概要）

家族グループを `families` テーブル、ユーザーとの所属関係を `family_members` 中間テーブルで管理する。
レシピ共有は `recipes.author_id` と家族メンバーシップの組み合わせで判定し、`is_draft` フラグと連動させる。
アクセス制御の主軸は Supabase RLS とし、アプリ層（ドメイン・ユースケース）でも整合性を二重に確認する。

---

## 採用した設計

### 1. 家族グループ + メンバー中間テーブル

| テーブル | 役割 |
|---|---|
| `families` | 家族グループ本体（名前・オーナー・作成日時） |
| `family_members` | ユーザーとグループの多対多の所属関係 |

**理由**

- 1 ユーザーが複数グループに所属する拡張に耐える（現時点では 1 グループ想定だが、スキーマは将来を見据えている）
- 「同じ家族かどうか」の判定根拠を 1 か所に集約できる
- レシピテーブルに `family_id` を持たせず、作成者経由で間接的に共有範囲を決める設計と両立する

関連: [`docs/tables/family/families.md`](../../tables/family/families.md)、[`docs/tables/family/family_members.md`](../../tables/family/family_members.md)

---

### 2. オーナー（`owner_id`）によるグループ管理

`families.owner_id` にグループ作成者を記録し、**グループ名の変更（UPDATE）はオーナーのみ**許可する。

**理由**

- メンバー全員に UPDATE 権限を与えると、意図しないグループ名変更が起きうる（レビュー指摘 I-4 対応）
- ロール列（admin / member）を導入するより、第 1 段階ではシンプルに「作成者 = オーナー」で十分
- グループ作成時はアプリ層で `INSERT families` と同時に `INSERT family_members` を行い、作成者を最初のメンバーとして登録する

---

### 3. レシピ共有は `author_id` + 家族メンバーシップで判定（`family_id` 列は持たない）

`recipes` テーブルに `family_id` カラムは設けない。
「同じ家族のメンバーか」は `family_members` を経由し、`is_same_family(author_id)` で判定する。

**理由**

- レシピ作成時に家族 ID を誤って設定するリスクを排除できる
- ユーザーが家族を脱退・再参加した場合も、作成者（`author_id`）とメンバーシップの現時点の状態で正しく判定できる
- 子テーブル（材料・手順・カテゴリ）へ `family_id` を伝播する必要がなく、正規化が保たれる

---

### 4. `is_draft` と連動した 2 軸のアクセス制御

| `is_draft` | アクセス範囲 |
|---|---|
| `true`（一時保存） | 作成者（`author_id`）のみ全操作可 |
| `false`（公開済み） | 作成者、または同じ家族のメンバーが全操作可 |

**理由**

- 下書き中のレシピを家族に見せないという自然な UX と一致する
- 公開済みレシピは家族全員が編集・削除できるため、「家族の資産」として共同で手入れできる
- レシピごとの公開範囲設定 UI を第 1 段階では不要にできる

関連: [`docs/tables/README.md` の RLS 設計方針](../../tables/README.md)

---

### 5. RLS ヘルパー関数（`security definer`）

| 関数 | 用途 |
|---|---|
| `get_my_family_ids()` | 自分が所属する `family_id` 一覧を返す |
| `is_same_family(p_user_id)` | 指定ユーザーと自分が同じ家族に所属しているか判定 |

`family_members` の RLS は自テーブル参照による**無限再帰**を避けるため、上記関数を `security definer` + `set search_path` で実装する。

**理由**（詳細は [ADR 006: RLS ヘルパー関数](./06-rls-helper-functions.md) を参照）

- `family_members` の SELECT ポリシーが同テーブルを参照すると RLS が再帰しエラーになる（Supabase 公式も推奨するパターン）
- `recipes` など他テーブルのポリシーからも同じ判定ロジックを再利用できる
- Schema Poisoning を防ぐため `set search_path = public, pg_temp` を付与

---

### 6. 子テーブル RLS の集約ビュー `accessible_recipe_ids`

`recipe_ingredients` / `recipe_instructions` / `recipe_categories` の RLS は、`accessible_recipe_ids` ビュー（`security_invoker = true`）経由で親 `recipes` の RLS を再利用する。

**理由**

- 「自分のレシピか？同じ家族か？`is_draft` はどうか？」という条件を子テーブルごとに重複記述しない
- `recipes` の RLS 変更がビュー経由で子テーブルに自動追従する
- `security_invoker = true` により、スーパーユーザー権限での RLS バイパスを防ぐ

関連: [`docs/tables/view/accessible_recipe_ids.md`](../../tables/view/accessible_recipe_ids.md)

---

### 7. メンバー操作は「自分自身のみ」

| 操作 | 条件 |
|---|---|
| `family_members` INSERT | `user_id = auth.uid()`（自分自身の参加のみ） |
| `family_members` DELETE | `user_id = auth.uid()`（自分自身の脱退のみ） |

**理由**

- 他メンバーの強制追加・削除は招待フローと権限設計が必要になるため、第 1 段階では範囲外
- RLS だけで「自分だけ参加・脱退できる」ことを保証できる
- 招待リンク経由の参加は、本人が INSERT する形で自然に実装できる

---

### 8. 外部キーは `ON DELETE CASCADE`

`family_members` は `families` / `auth.users` 削除時に CASCADE。
家族グループ削除時はメンバー行も連鎖削除する。

**理由**

- 孤立したメンバー行や不整合な所属関係を残さない
- 家族向けの規模では CASCADE による意図しない大量削除のリスクは低い

---

### 9. クリーンアーキテクチャに沿ったドメイン設計

| 層 | 採用内容 |
|---|---|
| `domain/models` | `Family`, `FamilyMember` |
| `domain/repositories` | `FamilyRepository`, `FamilyMemberRepository` |
| `usecase` | グループ作成時にリポジトリをオーケストレーション（作成 + メンバー追加） |
| `infrastructure` | Supabase 実装（未実装・これから） |

**理由**

- 既存のレシピ機能と同じ層分離・deps パターンを踏襲できる
- RLS だけに頼らず、ユースケース層でも「未所属ユーザー」「重複参加」等を検証する二重防御が可能

---

### 10. 第 1 段階は「1 ユーザー 1 家族グループ」想定

スキーマは多対多を許容するが、ユースケース・UI は 1 グループ所属を前提とする。

**理由**

- プロダクトの主ユースケース（核家族・世代を超えた 1 つのレシピ帳）に合致する
- 複数家族 UI（切り替え・招待先の選択）の設計コストを第 1 段階では避ける
- 将来の拡張時にスキーマ変更が不要

---

## 採用しなかった設計

### 1. `recipes` への `family_id` 列の付与

**理由**

- 作成時の設定ミス・家族変更時の不整合リスクがある
- `author_id` + `family_members` で十分に共有範囲を表現できる
- 子テーブルへの `family_id` 伝播が不要になり、スキーマが単純になる

---

### 2. メンバーロール（admin / member / viewer 等）

`family_members` に `role` 列を設けず、`families.owner_id` によるオーナー判定のみとする。

**理由**

- 第 1 段階で必要な権限差は「グループ名変更 = オーナーのみ」に限定される
- ロール列を導入すると RLS・UI・招待フローすべてに分岐が増える
- 公開済みレシピは家族全員が編集可能という方針と、細かいロール設計は相容れない

---

### 3. オーナーによる他メンバーの強制削除・招待承認

`family_members` DELETE は自分自身のみ。オーナーが他者を追放する機能は第 1 段階では提供しない。

**理由**

- 「追放」と「招待」の設計をセットで考える必要がある
- 悪用・誤操作時の復旧フロー（再招待・データ権限）の検討が必要
- 第 1 段階の MVP では脱退のみで運用可能

---

### 4. `families` の DELETE（グループ解散）

RLS 上、`families` の DELETE は許可しない。

**理由**

- グループ解散時にレシピ・メンバー・画像等の扱いを一括設計する必要がある
- 誤削除の影響が大きい
- 将来的にオーナー限定の解散フロー、または管理者ロールで対応を検討

---

### 5. 招待機能の具体実装（招待リンク・招待コード・メール招待）

DB・RLS は「本人が `family_members` に INSERT する」前提まで整備済みだが、招待 UI・トークン管理・有効期限は第 1 段階のスコープ外とする。

**理由**

- 招待方式（URL トークン / コード / メール）ごとにセキュリティ・UX の検討が必要
- 家族機能のコア（グループ作成・所属・レシピ共有）を先に成立させる
- RLS は招待なしでも「認証済みユーザーが自分で参加する」形で動作検証できる

---

### 6. レシピごとの公開範囲設定（家族内の部分公開）

`is_draft`（下書き / 公開済み）の 2 状態のみとし、「家族内の特定メンバーだけ」等の細かい公開範囲は設けない。

**理由**

- UI・RLS・検索のすべてに公開範囲の分岐が入る
- 家族向けクローズドアプリでは「下書きは自分だけ、公開したら家族全員」で十分なケースが多い
- 複雑な公開設定はユーザーにとっても理解コストが高い

---

### 7. 家族メンバーによる他人レシピへの新規 INSERT（材料・手順の追加）

子テーブルの INSERT は**作成者（`author_id`）のみ**許可する。家族メンバーは公開済みレシピの SELECT / UPDATE / DELETE は可能だが、他人のレシピに対する INSERT は不可。

**理由**

- レシピ本体の作成者責任を明確に保つ
- 他人レシピへの部品追加は、データ整合性・監査の観点で別設計が必要
- 公開済みレシピの編集（UPDATE）で内容変更は可能

関連: [`docs/tables/recipe/recipe_ingredients.md`](../../tables/recipe/recipe_ingredients.md)

---

### 8. `family_members` の UPDATE

参加日時（`joined_at`）以外の更新は想定しない。属性変更は脱退して再参加する。

**理由**

- 現時点でメンバー行に可変属性（ロール・表示名等）がない
- UPDATE ポリシーを増やすと RLS の複雑さが上がる

---

### 9. RLS のみにセキュリティを委ねる（アプリ層チェックなし）

**理由**

- RLS の設定ミス・バイパス経路（サービスロール誤用等）への備えが必要
- ADR 002（Supabase）で「ドメイン層でも整合性チェックを二重に行う」と決定済み
- ユースケース層で「未所属」「重複参加」「オーナー以外の名前変更」等を明示的に拒否する

---

### 10. 公開レシピサイト・外部共有

家族外へのレシピ公開、URL による誰でも閲覧可能な共有は提供しない。

**理由**

- プロダクトの Core Concept「Closed Environment」と矛盾する
- 離乳食などセンシティブな内容を安心して保存するという価値提案の根幹

関連: [`README.md`](../../README.md) の Closed Environment

---

## 結果・利点

- Postgres RLS で家族単位のデータ分離を DB 層で保証できる
- レシピ共有ロジックが `is_draft` + `is_same_family()` に集約され、一貫性が高い
- スキーマは将来の複数家族所属・招待機能・ロール拡張に耐える
- クリーンアーキテクチャの既存パターンに沿ってアプリ層を段階的に実装できる

---

## 考慮点・トレードオフ

| 項目 | 内容 |
|---|---|
| 招待未実装 | メンバー追加の UX は第 1 段階では未完成。DB は参加の受け皿のみ |
| 1 家族想定 | スキーマは多対多だが UI は単一家族前提。複数所属時の挙動は未定義 |
| 公開済みレシピの共同編集 | 家族全員が DELETE 可能。誤削除対策（履歴・復元）は別途検討 |
| `owner_id` の固定 | オーナー譲渡は第 1 段階では未対応 |
| ユーザー削除時 | `families.owner_id` の FK は現時点 CASCADE 未設定。削除時挙動は要検討 |
| `security definer` 関数 | 実装・レビューを怠ると権限昇格のリスクがある。`search_path` 固定は必須 |

---

## 第 1 段階の実装スコープ（参考）

| レイヤー | 状態 | 内容 |
|---|---|---|
| DB（マイグレーション） | 完了 | `families`, `family_members`, RLS, ヘルパー関数 |
| `domain/models` | 完了 | `Family`, `FamilyMember` |
| `domain/repositories` | インターフェースのみ | `FamilyRepository`, `FamilyMemberRepository` |
| `infrastructure` | 未実装 | Supabase リポジトリ実装 |
| `usecase` | 未実装 | グループ作成・参加・脱退・一覧取得 |
| `app` | 未実装 | Server Action |
| `presentation` | 未実装 | 家族設定画面・招待 UI（招待は後続） |

---

## 関連ドキュメント

- [テーブル定義: families](../../tables/family/families.md)
- [テーブル定義: family_members](../../tables/family/family_members.md)
- [RLS 設計方針](../../tables/README.md)
- [ADR 002: Supabase](./02-Supabase.md)
- [ADR 006: RLS ヘルパー関数](./06-rls-helper-functions.md)
- [クリーンアーキテクチャとディレクトリ構成](../../architect/clean-architecture-and-directory.md)
