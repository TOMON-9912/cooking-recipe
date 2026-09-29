# レシピ詳細取得

## 仕様

閲覧できるレシピ 1 件の本文・材料・手順・カテゴリを表示用に取得できる。

## スコープ

### 含める

- ID 指定の 1 件取得
- `/recipe/[id]` からの利用

### 含めない

- 一覧・検索
- 更新・削除

## 設計

```text
recipe/[id]/page.tsx
  → getRecipeDetailUsecase
    → getRecipeById（RLS で見えない ID は取れない）
```

| 層 | パス | 役割 |
| --- | --- | --- |
| usecase | `src/usecase/recipe/get-recipe-detail-usecase.ts` | 取得のオーケストレーション |
| page | `src/app/recipe/[id]/page.tsx` | 署名 URL、作者判定、編集導線 |

usecase はリポジトリの 1 件取得に委譲するだけ。可視性は RLS と画面側の 404 に任せる。

## テスト設計

| ケース | 層 | 期待 |
| --- | --- | --- |
| 存在する閲覧可能な ID | usecase | 1 件返る |
| 無い / 見えない ID | page | 404 |
| 作者 | page | 編集へ進める |
| 作者以外 | page | 編集ボタンなし |

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [recipe-detail.md](../../06_ui/screens/recipe-detail.md) |
