# 家族ドメインがゲスト作成を本登録限定に見える

| 項目 | 内容 |
| --- | --- |
| Trigger | `/review`（docs 追加差分） |
| Fact | `docs/02_design/domain/family.md` のアクター表は「未所属の本登録ユーザー」がグループを作れると書く。ADR 007 はゲストに「自分だけの家族作成」を許可し、招待・参加だけ本登録関門にしている。権限表は「未所属ユーザー」と書いており、同一ファイル内でも食い違う |
| Problem | 実装・ADR とドメイン正本がずれ、ゲスト作成を誤って禁止した設計に見える |
| Root cause | 新規 family.md を書くとき、招待関門と作成権限を同じ「本登録」にまとめた |
| Missing knowledge | なし（ADR 007 にある） |
| Proposed change | `family.md` のアクターを「未所属ユーザー（ゲストも作成可）。招待・参加は本登録」に直す |
| Target | Documentation |
| Status | proposed |
| Source | ai-review |
| Recurrence | なし |
| Decision | 未決 |
