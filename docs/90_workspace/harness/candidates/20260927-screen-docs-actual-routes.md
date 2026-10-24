# 画面 docs が実ルートと成功遷移を確定していない

| 項目 | 内容 |
| --- | --- |
| Trigger | `/review`（docs 追加差分） |
| Fact | `docs/02_design/ui/screens/recipe-new.md` は成功後を「詳細または一覧（実装の redirect に従う）」と書く。実装は `RecipeForm` が `/recipe/{id}` へ `router.push` する。`docs/02_design/ui/screens/family.md` は `/family/new` を「作成フォーム」と書くが、当該 page は `/family` へ redirect するだけである |
| Problem | 画面正本から導線が確定せず、次の実装・レビューがコードを見直す |
| Root cause | 画面 docs を量産するとき、ルートと成功遷移をコードで確認しきらずプレースホルダで済ませた |
| Missing knowledge | `/design` や画面テンプレに「実在ルートと成功遷移をコードで確定する」手順が無い |
| Proposed change | `02_design/ui/screens/_template.md` のルート／導線に「実装の page を見て書く。未確認なら未記載」と 1 行足す |
| Target | Skill |
| Status | proposed |
| Source | ai-review |
| Recurrence | 同一差分で 2 画面。2026-10-19 に `docs/02_design/ui/screens/family-join.md` が未実装の `/family/join/{token}` を実ルートとして書いた（`src/app/family/` に当該 page は無い）。テンプレの「未確認なら未記載」は既にある |
| Decision | 未決 |
