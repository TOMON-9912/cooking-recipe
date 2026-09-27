# ADR 009: AI 開発ハーネス

## 背景

このリポジトリでは Cursor のチャットで実装・レビューを進めている。Rules・Commands・Skill は既にあるが、次のずれが起きていた。

- 同じ手順が Rule / Command / Skill に重複している
- Skill や Command が、整理前の docs パスを指している
- チャットでの指摘や AI レビューが、次の作業に残らない
- 指摘をその場で Rule に足すと、肥大・矛盾・常時コンテキストの増加が先に来る

目的は「AI にコードを書かせる Rule を増やすこと」ではない。実装・レビュー・人間のフィードバックを、**人間の採否を経て**次回の開発品質に反映できる環境を作ることである。

## 決定内容

チャット指示を起点とするループを採用する。

```
指示 → Rules / Skills / docs（01〜09）の確認 → 実装 → レビュー
  → ずれの検出 → 改善候補 → 人間の Adopt / Defer / Reject
  → 採用時のみ Rule / Skill / Documentation を更新 → 次の開発
```

- プロダクトの正本は `docs/01`〜`docs/09` のままとする。ハーネス用の第二の設計書は置かない
- Rule は常時の不変条件、Skill は特定作業の手順、Command は Workflow の入口、Documentation はプロダクト固有の事実
- 改善は `docs/90_workspace/harness/candidates/` に 1 件 1 ファイルで残す。AI は候補作成までとし、採否は人間が決める
- ユーザーが明示しない限り、AI は `.cursor/rules/**` と `.cursor/skills/**` を変更しない

## なぜこの分離か

プロダクト仕様（例: レシピ更新時に材料も置き換える）を Rule に書くと、常時コンテキストが膨らみ、仕様変更のたびにハーネスと docs が二重管理になる。仕様は Documentation、守る向きは Rule、手順は Skill に分ける。

## なぜ AI による Rule / Skill の自動変更を禁止するか

指摘は一度きり・文脈依存・後から覆ることがある。自動で Rule 化すると、矛盾した常時制約と肥大が先に来る。候補まで止め、Adopt のときだけ最小差分で更新する。

## なぜ Adopt / Defer / Reject を人間が決めるか

「再発しそうか」「一般化できるか」「既に docs にあるか」「常時 Rule にする価値があるか」は、プロジェクトの判断である。回数だけで Rule 化しない。発生回数は参考であり、採用理由そのものにはしない。

`Judgment` という Target は、今回限りの判断でありハーネス知識として残さない、という意味で使う。

## 結果・利点

- 指摘がセッションをまたいで候補として残る
- 正本が docs に固定され、Rule が増えにくい
- 既存の implement / pairpro / review / transcribe を入口として維持できる

## 考慮点・トレードオフ

- 候補を書いても採否しなければ改善しない（運用が必要）
- Command を薄くすると、Skill を読まないとそのモードの手順が足りない
- workspace 配下の候補は公開 docs ではない（意図どおり）

## 関連

- 運用の正: `docs/90_workspace/harness/README.md`
- 常時 Rule: `.cursor/rules/harness-governance.mdc`
- 続き: [ADR 010 Issue 起点の開発フロー](./010-issue-centered-dev-flow.md)
