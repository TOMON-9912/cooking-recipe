-- =============================================================================
-- お気に入り付きサマリーはビューで表現し、アプリは通常の select で読む。
-- 旧 RPC recipe_summaries_with_favorite_for_filter は廃止する。
-- =============================================================================

drop function if exists public.recipe_summaries_with_favorite_for_filter(uuid[]);

create or replace view public.recipe_summaries_with_favorite
  with (security_invoker = true)
as
select
  rs.*,
  (rf.recipe_id is not null) as is_favorited
from public.recipe_summaries rs
left join public.recipe_favorites rf
  on rf.recipe_id = rs.id
 and rf.user_id = auth.uid();

comment on view public.recipe_summaries_with_favorite is
  'recipe_summaries にログインユーザー向け is_favorited を付与。';

grant select on public.recipe_summaries_with_favorite to authenticated;
