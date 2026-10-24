# テスト設計 Skill が観点表を参照しない

| 項目 | 内容 |
| --- | --- |
| Trigger | ブランチ `docs/44-test-design-family-member-join` のコミット `6cc72d9`（汎用テスト観点表）のレビュー |
| Fact | `docs/03_test/viewpoints-unit.md` と `docs/03_test/viewpoints-e2e.md` を、操作ごとのケースを書く前の正本として追加した。`.cursor/skills/write-test-design/SKILL.md` の書き方は、操作ファイルをひな形から書くことまでで、この観点表を参照しない |
| Problem | Skill だけに従うと、観点表を使わず操作ケースを書ける。正本が文書と手順で分かれる |
| Root cause | 観点表は今回の文書追加であり、テスト設計 Skill の手順は更新していない |
| Missing knowledge | 操作ケースを、汎用観点の該当 ID だけに落とす手順（Skill） |
| Proposed change | `.cursor/skills/write-test-design/SKILL.md` の書き方に、操作ケースは `docs/03_test/viewpoints-unit.md` と `viewpoints-e2e.md` の該当観点だけを落とす、と 1 文足す |
| Target | Skill |
| Status | proposed |
| Source | ai-review |
| Recurrence | なし |
| Decision | 未決 |

## Decision（採否後）

| 項目 | 内容 |
| --- | --- |
| 結果 | |
| 日付 | |
| 理由 | |
| 実際に変えたファイル | |
