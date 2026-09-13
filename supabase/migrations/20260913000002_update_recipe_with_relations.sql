-- レシピ更新を 1 トランザクションで行う。
-- 関連データは「全削除 → 再挿入」のため、途中で失敗すると材料や手順が消えたまま残る。
-- 関数内は単一トランザクションになるので、失敗時は更新前の状態へ戻る。
-- security invoker のため、呼び出したユーザーの RLS がそのまま適用される。
create or replace function public.update_recipe_with_relations(
  p_recipe_id uuid,
  p_title text,
  p_description text,
  p_thumbnail_url text,
  p_serving_count integer,
  p_preparation_time_minutes integer,
  p_is_draft boolean,
  p_ingredients jsonb,
  p_instructions jsonb,
  p_category_ids uuid[]
)
returns recipes
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_recipe recipes;
begin
  update recipes
     set title = p_title,
         description = p_description,
         thumbnail_url = p_thumbnail_url,
         serving_count = p_serving_count,
         preparation_time_minutes = p_preparation_time_minutes,
         is_draft = p_is_draft
   where id = p_recipe_id
  returning * into v_recipe;

  -- RLS で対象行が見えない場合もここに来る
  if v_recipe.id is null then
    raise exception 'RECIPE_UPDATE_FAILED';
  end if;

  delete from recipe_ingredients where recipe_id = p_recipe_id;

  insert into recipe_ingredients (
    recipe_id, name, quantity_display, quantity_value, unit, note, order_position
  )
  select
    p_recipe_id,
    item->>'name',
    item->>'quantity_display',
    (item->>'quantity_value')::numeric,
    item->>'unit',
    item->>'note',
    (item->>'order_position')::integer
  from jsonb_array_elements(coalesce(p_ingredients, '[]'::jsonb)) as item;

  delete from recipe_instructions where recipe_id = p_recipe_id;

  insert into recipe_instructions (recipe_id, step_number, description, image_url)
  select
    p_recipe_id,
    (item->>'step_number')::integer,
    item->>'description',
    item->>'image_url'
  from jsonb_array_elements(coalesce(p_instructions, '[]'::jsonb)) as item;

  delete from recipe_categories where recipe_id = p_recipe_id;

  insert into recipe_categories (recipe_id, category_id)
  select p_recipe_id, category_id
  from unnest(coalesce(p_category_ids, '{}'::uuid[])) as category_id;

  return v_recipe;
end;
$$;

grant execute on function public.update_recipe_with_relations(
  uuid, text, text, text, integer, integer, boolean, jsonb, jsonb, uuid[]
) to authenticated;
