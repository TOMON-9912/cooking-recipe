# 設計書レビューの Skill が無い

| 項目 | 内容 |
| --- | --- |
| Trigger | ブランチ `docs/42-design-family-member-join` の変更済み設計書レビュー |
| Fact | `review-code` はアプリケーションコード向けである。`docs/02_design` を確定済み要件（FR / NFR、設計への申し送り）と照合する Skill は無い。当該ブランチの設計書は、確定済みの宛先指定＋承認ではなく、以前の招待リンク（トークン）案のままである |
| Problem | 設計フェーズのレビュー手順が無く、要件と矛盾した設計書が「草案」のまま残る |
| Root cause | `/review` の対象が実装コードに限られている |
| Missing knowledge | 仕様・設計を要件 ID と照合する手順（Skill） |
| Proposed change | `.cursor/skills/` に、確定済み要件の FR / NFR と設計への申し送りを設計書と照合するレビュー Skill を 1 つ追加する |
| Target | Skill |
| Status | adopted |
| Source | ai-review |
| Recurrence | なし |
| Decision | Adopt（2026-10-19。ユーザーが設計レビュー Skill の作成を明示依頼） |

## Decision（採否後）

| 項目 | 内容 |
| --- | --- |
| 結果 | Adopt |
| 日付 | 2026-10-19 |
| 理由 | ユーザーが設計書レビュー用スキルの作成を依頼した。標準観点に加えセキュリティを厚くする指定があった |
| 実際に変えたファイル | `.cursor/skills/review-design/SKILL.md`、`.cursor/skills/review-design/checklist.md`、`.cursor/commands/review-design.md` |
