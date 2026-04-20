-- キーワード検索: ILIKE の % / _ メタ文字を避け、ユーザー入力をリテラル部分文字列として扱う（strpos + lower）
create or replace function public.recipe_summaries_ids_matching_keyword(search_keyword text)
returns uuid[]
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    array(
      select r.id
      from recipe_summaries r
      where not r.is_draft
        and trim(coalesce(search_keyword, '')) <> ''
        and (
          strpos(lower(r.title), lower(trim(search_keyword))) > 0
          or strpos(
            lower(coalesce(r.description, '')),
            lower(trim(search_keyword))
          ) > 0
        )
      order by r.updated_at desc
    ),
    '{}'::uuid[]
  );
$$;

grant execute on function public.recipe_summaries_ids_matching_keyword(text) to authenticated;
