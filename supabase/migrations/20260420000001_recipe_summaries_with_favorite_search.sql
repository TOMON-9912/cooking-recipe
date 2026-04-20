-- =============================================================================
-- 検索結果相当の recipe_summaries 行に、現在ユーザー向け is_favorited を付与して
-- JSON 配列で返す（アプリ側での全件お気に入り ID 取得＋マージを避ける）。
-- p_recipe_ids が NULL のときは公開済み（is_draft = false）の全行が対象。
-- =============================================================================

create or replace function public.recipe_summaries_with_favorite_for_filter(
  p_recipe_ids uuid[] default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if p_recipe_ids is not null and cardinality(p_recipe_ids) = 0 then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(to_jsonb(t) order by t.updated_at desc)
      from (
        select
          rs.id,
          rs.title,
          rs.description,
          rs.thumbnail_url,
          rs.serving_count,
          rs.preparation_time_minutes,
          rs.is_draft,
          rs.author_id,
          rs.created_at,
          rs.updated_at,
          rs.categories,
          (rf.recipe_id is not null) as is_favorited
        from recipe_summaries rs
        left join recipe_favorites rf
          on rf.recipe_id = rs.id
         and rf.user_id = auth.uid()
        where rs.is_draft = false
          and (
            p_recipe_ids is null
            or rs.id = any (p_recipe_ids)
          )
      ) t
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.recipe_summaries_with_favorite_for_filter(uuid[])
  to authenticated;
