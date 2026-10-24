# レシピサムネイルアップロード

## 仕様

作者が、レシピ用のサムネイル画像を保存し、レシピから参照できるパスを得られる。

## スコープ

### 含める

- `uploadRecipeThumbnailAction`（作成・編集で共用）
- 空・サイズ・Content-Type の検証
- 圧縮せず原寸保存（ADR 008）

### 含めない

- 手順画像
- HEIF
- 差し替え後の Storage 削除（更新 usecase 側）

## 設計

```text
upload-recipe-thumbnail-action.ts
  → uploadRecipeThumbnailUsecase
    → RecipeThumbnailStorage（private バケット）
```

上限と許可タイプは `src/constants/recipe-thumbnail-upload.ts`。DB にはパスだけ残す。

## 関連

| 種類 | リンク |
| --- | --- |
| ADR | [008](../../../04_decisions/008-image-storage.md) |
| Storage | [storage-security.md](../../database/storage-security.md) |
| 作成 / 更新 | [create-recipe.md](./create-recipe.md)、[update-recipe.md](./update-recipe.md) |
| テスト設計 | [upload-recipe-thumbnail.md](../../../03_test/design/recipes/upload-recipe-thumbnail.md) |
