-- 編集・削除は作者本人のみに揃える。
-- これまで recipes の update / delete は家族メンバーにも開いており、
-- 子テーブルの delete は「閲覧できる人なら誰でも」だった（insert は作者限定なので不整合）。
-- アプリ側は作者本人しか更新しないため、DB 側もその範囲に合わせる。
-- 家族メンバーによる編集を解禁するときは、アプリの認可と合わせてこのポリシーを戻すこと。

drop policy if exists "family members can update published recipes" on recipes;
drop policy if exists "family members can delete published recipes" on recipes;

drop policy if exists "users can delete accessible recipe categories" on recipe_categories;

create policy "authors can delete own recipe categories"
  on recipe_categories for delete
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_categories.recipe_id
        and r.author_id = auth.uid()
    )
  );

drop policy if exists "users can update accessible recipe ingredients" on recipe_ingredients;
drop policy if exists "users can delete accessible recipe ingredients" on recipe_ingredients;

create policy "authors can update own recipe ingredients"
  on recipe_ingredients for update
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and r.author_id = auth.uid()
    )
  );

create policy "authors can delete own recipe ingredients"
  on recipe_ingredients for delete
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and r.author_id = auth.uid()
    )
  );

drop policy if exists "users can update accessible recipe instructions" on recipe_instructions;
drop policy if exists "users can delete accessible recipe instructions" on recipe_instructions;

create policy "authors can update own recipe instructions"
  on recipe_instructions for update
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_instructions.recipe_id
        and r.author_id = auth.uid()
    )
  );

create policy "authors can delete own recipe instructions"
  on recipe_instructions for delete
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_instructions.recipe_id
        and r.author_id = auth.uid()
    )
  );
