# 食卓手帖 — ドキュメント

番号は、読む順（何を作るか → どう作るか → どう確かめるか → なぜそうしたか）に対応する。

| 場所 | 役割 |
| --- | --- |
| [01_requirements](./01_requirements/README.md) | **何を作るか、なぜ作るか**（要件定義。設計の前に書く） |
| [02_design/architecture](./02_design/architecture/overview.md) | どういう構造か |
| [02_design/domain](./02_design/domain/overview.md) | どういうドメインモデルか（仕様） |
| [02_design/database](./02_design/database/er-diagram.md) | どういう DB 構造か |
| [02_design/application](./02_design/application/use-cases.md) | どういう処理構造か |
| [02_design/api](./02_design/api/overview.md) | API をどう設計したか |
| [02_design/ui](./02_design/ui/screen-flow.md) | どういう画面か |
| [03_test](./03_test/strategy.md) | どうテストするか。操作ごとのテスト設計は [03_test/design](./03_test/design/README.md) |
| [04_decisions](./04_decisions/001-architecture.md) | **なぜその設計にしたか**（ADR） |
| [05_development](./05_development/setup.md) | どう開発するか |
| [90_workspace](./90_workspace/README.md) | 作業用（harness・learning・QA・reviews・work） |

ローカル閲覧: リポジトリルートで `npm run docs:dev`（VitePress）。`90_workspace` はサイトビルド対象外。
