# アーキテクチャ概要

食卓手帖は **Next.js（App Router）** 上で、**クリーンアーキテクチャ** に沿って層を分けています。

## 層の役割

| 層 | ディレクトリ | 役割 |
| --- | --- | --- |
| presentation | `src/presentation/` | UI・フォーム |
| app | `src/app/` | Server Actions、ルート、deps 組み立て |
| usecase | `src/usecase/` | オーケストレーション・入力検証 |
| domain | `src/domain/` | 型・リポジトリ契約 |
| infrastructure | `src/infrastructure/` | Supabase・Storage 実装 |

依存は **外側 → 内側のみ**。詳細な図と CRUD の流れは [data-flow.md](./data-flow.md) を参照してください。

## 関連ドキュメント

- [システムコンテキスト](./system-context.md) — 外部サービスとデプロイ
- [database/storage-security.md](../03_database/storage-security.md) — 画像 Storage のセキュリティ
- [development/eslint-clean-architecture.md](../08_development/eslint-clean-architecture.md) — import 制限
