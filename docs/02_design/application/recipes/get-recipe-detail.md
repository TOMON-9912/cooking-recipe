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

## 関連

| 種類 | リンク |
| --- | --- |
| 画面 | [recipe-detail.md](../../ui/screens/recipe-detail.md) |
| テスト設計 | [get-recipe-detail.md](../../../03_test/design/recipes/get-recipe-detail.md) |
