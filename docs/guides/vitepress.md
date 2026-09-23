# VitePress ドキュメントサイト

リポジトリ内の `docs/` を [VitePress](https://vitepress.dev/) で閲覧するための設定です。GitHub 上の Markdown 閲覧に加え、**サイドバー・全文検索・コード行番号**で読みやすくしています。

## コマンド

リポジトリルートで実行します。

| コマンド | 用途 |
|---|---|
| `npm run docs:dev` | 開発サーバー（通常 http://localhost:5173） |
| `npm run docs:build` | 静的サイトを `docs/.vitepress/dist` に出力 |
| `npm run docs:preview` | ビルド結果のプレビュー |

## 構成

| パス | 役割 |
|---|---|
| `docs/index.md` | トップ（ホーム） |
| `docs/.vitepress/config.mts` | ナビ・サイドバー・テーマ |
| `docs/.vitepress/theme/` | ブランドカラー（emerald） |

既存の Markdown ファイルは **移動せず** そのままページになります。新しいページをサイドバーに載せるときは `config.mts` の `themeConfig.sidebar` を更新してください。

## 執筆時の注意

VitePress は Markdown を Vue としてコンパイルするため、次に注意します。

- 見出し内でバッククォートを二重に使わない
- 本文中の二重中括弧は Vue 插値と解釈される。GitHub Actions の secrets 参照は **コードブロック内** に書くか、HTML 実体参照でエスケープする
- URL のプレースホルダー（本番ドメインなど）はインラインコード内に書く

雛形だけの `docs/index/_template.md` はビルド対象外（`srcExclude`）です。

## 公開（任意）

`docs:build` の出力を GitHub Pages や Vercel の別プロジェクトに載せられます。本番アプリ（Next.js）とは別デプロイにしてください。
