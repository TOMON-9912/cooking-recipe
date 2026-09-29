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

## テスト設計

| ケース | 層 | 期待 |
| --- | --- | --- |
| 空ファイル | usecase | 拒否 |
| 上限超過 | usecase | 拒否 |
| 許可外タイプ | usecase | 拒否 |
| 正常 | usecase | path が返る |

## 関連

| 種類 | リンク |
| --- | --- |
| ADR | [008](../../09_decisions/008-image-storage.md) |
| Storage | [storage-security.md](../../03_database/storage-security.md) |
| 作成 / 更新 | [create-recipe.md](./create-recipe.md)、[update-recipe.md](./update-recipe.md) |
