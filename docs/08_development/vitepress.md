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

## 執筆時の注意

- 見出し内でバッククォートを二重に使わない
- 二重中括弧は Vue 插値と解釈される（Actions の secrets 参照はコードブロック内など）
- `04_application/source-index/_template.md` はビルド対象外（`srcExclude`）
