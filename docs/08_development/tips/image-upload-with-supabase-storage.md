# 画像アップロード（Supabase Storage）の設定と導入手順

## 概要

レシピのサムネイル画像は **Supabase Storage** に保存します。
データベースには画像の **パスのみ** を保存し、表示時にサーバーで署名 URL を発行します。

```
DB に保存するもの: user-id/uuid.jpg
表示時に生成:       createSignedUrl(path, 3600)
```

バケットは非公開です。URL を知っているだけでは誰でも見られません。
圧縮や形式変換はせず、選んだファイルを原寸のまま保存します。

判断の経緯は [ADR 008](../adr/08-image-storage.md) を参照してください。

---

## アップロードの流れ

```
① ブラウザ → Server Action     : FormData で画像を送る
② Action → usecase             : サイズ・MIME を検証する
③ usecase → Storage            : {authorId}/{uuid}.{ext} として upload
④ レシピ保存                    : 返ってきた path を recipes.thumbnail_url に書く
```

AWS の認証情報は使いません。ユーザーセッションと Storage RLS で制御します。

---

## ローカルでの確認

1. `npx supabase start`（または `npm run supabase:restart`）
2. マイグレーション適用後、Dashboard（Studio）→ **Storage** に `recipe-images` があること
3. バケットが **Private** であること
4. ログインした状態でレシピ登録し、サムネイルを付ける
5. Studio の `recipe-images` に `{userId}/{uuid}.{ext}` ができること
6. `/top` とレシピ詳細で画像が表示されること

---

## 本番

`npx supabase db push` でマイグレーションを適用すれば、バケット設定と RLS も入ります。
Vercel に追加する画像用の環境変数はありません。既存の `NEXT_PUBLIC_SUPABASE_*` だけで足ります。

旧 AWS S3 に残っているオブジェクトは移行しません。コンソールからバケットを削除して構いません。

---

## 主な定数

`src/constants/recipe-thumbnail-upload.ts`

| 定数 | 内容 |
|------|------|
| `RECIPE_THUMBNAIL_MAX_BYTES` | 入力ファイルの上限（15MB） |
| `RECIPE_THUMBNAIL_BUCKET` | バケット名（`recipe-images`） |

---

## トラブルシュート

| 症状 | 確認すること |
|------|----------------|
| アップロードは成功するが表示されない | バケットが Private か、SELECT RLS が当たっているか、`getSignedImageUrl` が `undefined` を返していないか |
| `new row violates row-level security` | パスが `{auth.uid()}/...` になっているか |
| 家族の画像だけ見えない | `is_same_family()` とフォルダ名の uuid が一致しているか |
| 15MB 以下なのに拒否される | Server Action の `bodySizeLimit` と Storage の `file_size_limit` が 15MB 以上か |
