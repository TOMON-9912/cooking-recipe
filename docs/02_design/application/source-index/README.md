# ソースコード一覧（index）

機能ごとに「**その処理で使うソースファイル**」をまとめるディレクトリです。

主な用途:

- リファクタリング時の変更対象の洗い出し
- feature ブランチでのスコープ（触ってよいファイル）の特定
- テスト追加・影響範囲の確認

処理の流れや仕様の詳細は [UI 画面設計](../../ui/screen-flow.md) を参照してください。source-index は**ファイルと機能の対応表**に特化します。

## 機能一覧

| ID | 機能 | ルート / 入口 | ドキュメント | 状態 |
|----|------|---------------|--------------|------|
| `recipe-search` | レシピ検索 | `/recipe/search` | [features/recipe-search.md](./features/recipe-search.md) | 記載済 |
| `recipe-top` | TOP・一覧 | `/top` | [features/recipe-top.md](./features/recipe-top.md) | 記載済 |
| `recipe-detail` | レシピ詳細 | `/recipe/[id]` | [features/recipe-detail.md](./features/recipe-detail.md) | 記載済 |
| `recipe-create` | レシピ登録 | `/recipe/new` | [features/recipe-create.md](./features/recipe-create.md) | 記載済 |
| `recipe-edit` | レシピ編集 | `/recipe/[id]/edit` | [features/recipe-edit.md](./features/recipe-edit.md) | 記載済 |
| `recipe-favorite` | お気に入り切替 | `/top` | [features/recipe-favorite.md](./features/recipe-favorite.md) | 記載済 |
| `auth` | ログイン・サインアップ | `/login`, `/signup` | [features/auth.md](./features/auth.md) | 記載済 |
| `family` | 家族 | `/family` | [features/family.md](./features/family.md) | 記載済 |
| `profile` | プロフィール作成 | `/profile/new` | [features/profile.md](./features/profile.md) | 記載済 |

> 新しい機能を追加したら、上表に 1 行追加し、`features/<ID>.md` を作成してください。

## ディレクトリ構成

```
docs/02_design/application/source-index/
├── README.md                 … 目次・書き方（このファイル）
├── _template.md              … 機能ドキュメントの雛形
└── features/
    ├── recipe-search.md      … 機能ごとのソース一覧
    └── …                     … 上表の ID と同名で追加
```

## ファイル命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 機能ドキュメント | `features/<ID>.md` | `features/recipe-search.md` |
| ID | 英小文字・kebab-case | `recipe-search`, `auth`, `recipe-create` |
| 日本語タイトル | ファイル先頭の `#` 見出しに書く | `# レシピ検索` |

- 1 機能 = 1 ファイル。複数機能にまたがるファイルは **関与 = 共用** とし、他機能ドキュメントへのリンクを概要に書く。
- 画面設計（`docs/02_design/ui/`）は仕様、source-index は**ファイルの地図**として役割を分ける。

## 各機能ドキュメントの構成

`_template.md` と同じ方針で書きます。**src の層（domain / usecase 等）で分けず**、その機能内の処理単位（区分）ごとに見出しを立て、表にまとめます。

1. **区分ごとのソースファイル** … 例: 検索実行 / 画面 / 結果表示 / データベース
2. **関連ドキュメント** … 設計書・テーブル定義へのリンク（任意）

## 表の書き方

| 列 | 用途 |
|----|------|
| **パス** | リポジトリ内のファイルパス |
| **種類** | model / usecase / repository / page / component / types / lib / migration など（参考情報） |
| **関与** | `専用` / `共用` / `導線のみ` |
| **主要 symbol** | 本機能で使う関数・型名（1 ファイルに複数ある場合） |
| **概要** | この機能における役割（1 行）。共用の場合は他機能 ID も記載 |

リファクタ時は **関与 = 専用** をブランチスコープの中心にし、**共用** は他機能の index とあわせて影響範囲を確認します。

## 関連ドキュメント

- [UI 画面フロー](../../ui/screen-flow.md)
- [クリーンアーキテクチャ（data-flow）](../../architecture/data-flow.md)
