-- 家族作成直後は family_members 未登録のため、owner_id による SELECT も許可する
drop policy if exists "members can select own families" on families;

create policy "members can select own families"
  on families for select
  using (
    id in (select get_my_family_ids())
    or owner_id = auth.uid()
  );
