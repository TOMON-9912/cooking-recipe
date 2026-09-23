# 画面遷移

実装（`src/app/`・`src/proxy.ts`・ヘッダー）に沿った導線の説明。画面ごとの UI 要件は [screens/](./screens/) 配下の設計書を参照。

## 全体図

<DiagramViewer
  src="/06_ui/images/screen-flow.svg"
  title="Screen flow"
  :base-width="1100"
  :initial-scale="1"
/>

## 情報設計の前提

| 方針 | 内容 |
| --- | --- |
| **ログイン後の拠点** | `/top`（ヒーロー + レシピ一覧 + クイックアクセス）。ログイン・ゲスト・メール確認 callback の成功先も基本 `/top`。 |
| **オンボーディング** | プロフィール未作成ユーザーは `/top` 到達時に **`/profile/new` へ強制 redirect**。家族参加は任意で `/family`。 |
| **グローバルナビ** | ログイン時ヘッダー（`sm` 以上）: **レシピ一覧** `/top`、**レシピ登録** `/recipe/new`、**家族管理** `/family`。 |
| **検索の位置づけ** | ヘッダーには載せず、**トップのクイックアクセス**から `/recipe/search` へ。一覧の「探す」用途は第2導線。 |
| **未ログイン** | 保護ルートは `src/proxy.ts` で `/login?redirectTo=…` へ。公開パスは同ファイルの `PUBLIC_PATHS`。 |

## ルート一覧

| パス | 認証 | 役割 | 主な入り口 |
| --- | --- | --- | --- |
| `/` | 不要 | LP | 直接、未ログイン時ロゴ |
| `/login` | 不要 | ログイン・ゲスト | LP、ヘッダー、ログアウト後 |
| `/signup` | 不要 | 新規登録 | LP |
| `/signup/verify-email` | 不要 | 確認メール案内 | signup 後 |
| `/auth/callback` | 不要（code 交換） | メール確認完了 | メール内リンク |
| `/profile/new` | 必要 | 初回プロフィール | `/top` からの redirect |
| `/top` | 必要 | **ホーム**・レシピ一覧 | ログイン成功、ロゴ、ナビ |
| `/family` | 必要 | 家族作成 or 概要 | ヘッダー、旧 `/family/new` |
| `/recipe/new` | 必要 | レシピ作成 | ヘッダー、ヒーロー CTA、空状態 |
| `/recipe/search` | 必要 | キーワード・カテゴリ検索 | トップクイックアクセス |
| `/recipe/[id]` | 必要 | 詳細 | 一覧カード |
| `/recipe/[id]/edit` | 必要 | 編集 | 詳細（作者） |

**本番導線外（検証用）:** `/lp/*`、`/top-preview/*`

## シナリオ別フロー

### 本登録してはじめて使う

1. `/` → `/signup` → （メール）→ `/auth/callback` → `/top`
2. プロフィールなし → **`/profile/new`** → 作成成功 → `/top?toast=profileCreated`
3. （任意）`/family` で家族作成 → `/top?toast=familyCreated`
4. 日常利用: `/top` から登録・一覧・検索・家族管理

### ゲストで試す

1. `/` または `/login` の「ゲストで試す」→ `/top` → 未プロフィールなら **`/profile/new`**
2. 以降は本ユーザーと同じ RLS 下で利用（[guest-login 設計](./screens/guest-login.md)）

### ログイン済みがブックマークした URL を開く

- セッション有効 → そのまま表示（例: `/recipe/[id]/edit`）
- セッションなし → `/login?redirectTo=元のパス` まで。**現状 login 成功時は `redirectTo` を見ず `/top` 固定**（`src/app/(auth)/login/login.action.ts`）。深い URL からの復帰は UX 改善候補。

## 画面設計書（機能単位）

| 画面 | ドキュメント |
| --- | --- |
| ゲストログイン | [screens/guest-login.md](./screens/guest-login.md) |
| レシピ検索 | [screens/recipe-search.md](./screens/recipe-search.md) |
| キーワード検索（詳細） | [screens/recipe-search-keyword.md](./screens/recipe-search-keyword.md) |

## UX メモ（ドキュメント用・改善候補）

読者・実装者向けに、現状の意図とギャップを分けておく。

1. **ホームは `/top` に一本化** — 旧ドキュメントのように LP からいきなり検索中心にしない。登録・一覧が主、検索は補助。
2. **`redirectTo` の未使用** — 未ログインで `/recipe/xxx` を開いたあと、ログインしても `/top` に落ちる。意図的なら ADR 化、バグなら login/guest-login で `redirectTo` を尊重。
3. **検索の発見性** — ヘッダに無いため、初見ユーザーは検索に気づきにくい。ヘッダ追加・トップのクイックアクセス順序・コピー見直しのいずれかを検討。
4. **未実装カード** — 献立カレンダー・買い物リストはトップに表示するがリンクなし（`badge: 実装予定`）。クリック不能であることは UI 上は明示済み。
