# 開発規約

## リポジトリ内ルール

| トピック | ドキュメント |
| --- | --- |
| Git ブランチ（feature → develop → main） | [git-branch-workflow.md](./git-branch-workflow.md) |
| ESLint / クリーンアーキ import 制限 | [eslint-clean-architecture.md](./eslint-clean-architecture.md) |
| VitePress | [vitepress.md](./vitepress.md) |
| Issue 起点の開発 | [issue-workflow.md](./issue-workflow.md) |

Cursor 向けの常時制約は `.cursor/rules/`。ハーネスは [AI 開発ハーネス](../90_workspace/harness/README.md)、[ADR 009](../09_decisions/009-ai-dev-harness.md)、[ADR 010](../09_decisions/010-issue-centered-dev-flow.md)。

## コミット・PR

エージェントは **明示指示がない限り** コミット・push・PR 作成を行いません（`.cursor/rules/git-workflow.mdc`）。
