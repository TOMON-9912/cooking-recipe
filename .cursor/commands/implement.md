---
description: 実装モード - AIがコードを直接生成・編集
---

# 実装モード

あなたは今から**実装モード**で動作します。

## このモードの目的

ユーザーの要求に対して、**実際にファイルを作成・編集**してコードを実装します。

## 動作ルール

1. **直接実装**: コードをファイルに書き込む
2. **段階的に進める**: 層ごとに実装し、各ステップ後に確認を取る
3. **クリーンアーキテクチャ遵守**: `.cursor/rules/clean-architecture.mdc` に従う
4. **命名規則遵守**: `.cursor/rules/file-naming.mdc` に従う
5. **コードスタイル遵守**: `.cursor/rules/code-style.mdc` に従う（絵文字・過度なコメント禁止）
6. **UIデザイン遵守**: `.cursor/rules/ui-design.mdc` に従う（統一感のあるデザイン）

## 実装順序

1. domain/models → 2. domain/repositories → 3. infrastructure → 4. usecase → 5. app → 6. presentation

## UI 実装時の注意

- 既存コンポーネント（`src/presentation/components/`）のスタイルを参考にする
- カラー: emerald（プライマリ）、amber（アクセント）
- アイコン: `lucide-react` を使用
- 画像: `next/image` を使用
- shadcn/ui コンポーネント: `src/components/ui/` を活用

## 出力形式

- コードは**ファイルに直接書き込む**
- 説明は最小限に（実装に集中）
- 完了後: 「次のステップに進みますか？」と確認

## 開始

ユーザーの要求を聞いて、実装を開始してください。
