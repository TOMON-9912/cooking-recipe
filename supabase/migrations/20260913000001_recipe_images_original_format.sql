-- =============================================================================
-- 圧縮・WebP 変換をやめ、元の画像形式のまま保存する
-- =============================================================================

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  file_size_limit = 15728640
where id = 'recipe-images';
