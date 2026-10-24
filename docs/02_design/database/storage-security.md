# Storage 画像セキュリティ設計

## 背景・課題

レシピのサムネイルには家族の写真も載る想定のため、**URL を知っていれば誰でも閲覧できる状態は避けたい**。

当初は AWS S3 を非公開にし、サーバーの IAM 認証情報でプレサイン URL を発行していた。保存先を Supabase Storage に移したあとも、同じ姿勢を維持する。

S3 との違いは、署名 URL の発行に **呼び出し元セッションの RLS が効く**ことである。SELECT ポリシーが無いと家族の画像が見えず、緩すぎると他人の画像が見える。

---

## 採用する設計：非公開バケット + 署名 URL

```
DB に保存するもの: {userId}/{uuid}.{ext}   ← パス
表示時に生成:       createSignedUrl(path, 3600)   ← 1 時間有効
```

- バケット `recipe-images` は `public = false`
- アップロードは Server Action 経由のみ（anon キー + ユーザーセッション）
- 表示は Server Component で署名 URL を発行し、`img src` に渡す
- 発行に失敗してもページ全体は落とさず、その画像だけプレースホルダーにする

---

## RLS

パスの先頭フォルダが作者の `auth.uid()` になる（`{authorId}/{uuid}.{ext}`）。

| 操作 | 誰ができるか |
|------|----------------|
| INSERT / UPDATE / DELETE | 先頭フォルダが自分の uid のオブジェクト |
| SELECT（署名 URL 発行） | 自分、または `is_same_family(先頭フォルダの uuid)` |

`recipes` テーブルの可視範囲（本人 + 同じ家族）に揃えている。

---

## 保存形式

圧縮や形式変換はしない。JPEG / PNG / WebP / GIF を 15MB まで、選んだファイルのまま保存する。

---

## コードの置き場所

| 役割 | ファイル |
|------|-----------|
| 保存契約 | `src/domain/repositories/recipe/recipe-thumbnail-storage.ts` |
| Storage 実装 | `src/infrastructure/storage/recipe-thumbnail-storage-impl.ts` |
| 署名 URL | `src/lib/get-signed-image-url.ts` |
| ルール | `src/usecase/recipe/upload-recipe-thumbnail-usecase.ts` |

`getSignedImageUrl` は秘密情報と RLS を扱うため、**Server Component / Server Action からのみ**呼ぶ。presentation からの import は ESLint で禁止している。
