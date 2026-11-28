-- 家族の作成は create_family だけ。直 INSERT のポリシーは置かない。

create or replace function create_family(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  if exists (
    select 1 from family_members where user_id = auth.uid()
  ) then
    raise exception 'ALREADY_IN_FAMILY' using errcode = 'P0001';
  end if;

  insert into families (name, owner_id)
  values (p_name, auth.uid())
  returning id into v_id;

  insert into family_members (family_id, user_id)
  values (v_id, auth.uid());

  return v_id;
exception
  when unique_violation then
    raise exception 'ALREADY_IN_FAMILY' using errcode = 'P0001';
end;
$$;

drop policy "authenticated users can insert families" on families;
drop policy "owner can add self as first member" on family_members;

alter table family_members
  add constraint family_members_user_id_key unique (user_id);

revoke all on function public.create_family(text) from public, anon;
grant execute on function public.create_family(text) to authenticated;
