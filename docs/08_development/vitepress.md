# VitePress ドキュメントサイト

リポジトリ内の `docs/` を [VitePress](https://vitepress.dev/) で閲覧するための設定です。

## コマンド

| コマンド | 用途 |
| --- | --- |
| `npm run docs:dev` | 開発サーバー（通常 http://localhost:5173） |
| `npm run docs:build` | 静的サイトを `docs/.vitepress/dist` に出力 |
| `npm run docs:preview` | ビルド結果のプレビュー |

## ディレクトリ構成

役割の一覧は [docs/README.md](../README.md) を参照してください。

| ディレクトリ | 役割 |
| --- | --- |
| `01_architecture/` | アプリ全体の構造 |
| `02_domain/` | ドメイン設計 |
| `03_database/` | DB 設計（`tables/`、`images/`） |
| `04_application/` | ユースケース・実装メモ |
| `05_api/` | Server Actions 等 |
| `06_ui/` | 画面設計 |
| `07_testing/` | テスト設計 |
| `08_development/` | 開発者向け手順 |
| `09_decisions/` | ADR |
| `90_workspace/` | 作業用（VitePress・公開対象外） |

設定は `docs/.vitepress/config.mts`。新規ページをサイドバーに載せるときは `themeConfig.sidebar` を更新します。

## 図表（ER 図・画面遷移）

### ER 図（DBML から自動生成）

`docs/03_database/cooking-recipe.dbml` を `docs/03_database/er.data.mts`（VitePress データローダー、`@dbml/core` でパース）が読み込み、`<ErDiagram>` と `<ErRelationTable>` が描画する。画像のエクスポートは不要。

```md
<ErDiagram :columns="[['profiles'], ['auth.users'], ['families', 'family_members']]" />
<ErRelationTable />
```

`columns` は列ごとのテーブル配置（上から順に積む）。リレーションは隣の列どうし、または同じ列の中で結ぶように並べる。手順は [er-diagram.md](../03_database/er-diagram.md) を参照。

### DiagramViewer（画像の図）

画面遷移図のような静的画像は、Markdown の `![](...)` だと本文幅に押し潰されるため `<DiagramViewer>`（`docs/.vitepress/theme/components/DiagramViewer.vue`）を使う。スクロール・ズーム・全画面・原ファイル直開きに対応。

```md
<DiagramViewer src="/06_ui/images/screen-flow.svg" title="Screen flow" :base-width="1100" />
```

`base-width` は画像の幅（px）に合わせる。

## 執筆時の注意

- 見出し内でバッククォートを二重に使わない
- 二重中括弧は Vue 插値と解釈される（Actions の secrets 参照はコードブロック内など）
- `04_application/source-index/_template.md` はビルド対象外（`srcExclude`）
