-- 家族招待。期限と認可は関数の中で閉じる。
-- 期限内未使用の一意は now() を部分 UNIQUE に書けないため、家族行ロックで拒否する。

create table family_invites (
  id             uuid        primary key default gen_random_uuid(),
  family_id      uuid        not null references families(id) on delete cascade,
  invited_email  text        not null,
  created_by     uuid        not null references auth.users(id) on delete cascade,
  expires_at     timestamptz not null,
  used_by        uuid        references auth.users(id) on delete set null,
  used_at        timestamptz,
  revoked_at     timestamptz,
  created_at     timestamptz not null default now(),
  constraint family_invites_used_pair check (
    (used_by is null and used_at is null)
    or (used_by is not null and used_at is not null)
  ),
  constraint family_invites_used_xor_revoked check (
    not (used_at is not null and revoked_at is not null)
  )
);

create index family_invites_family_id_invited_email_idx
  on family_invites (family_id, invited_email);

create index family_invites_family_id_idx
  on family_invites (family_id);

alter table family_invites enable row level security;

create policy "owner can select own family invites"
  on family_invites for select
  using (
    exists (
      select 1
      from families
      where families.id = family_invites.family_id
        and families.owner_id = auth.uid()
    )
  );

revoke all on table public.family_invites from public, anon, authenticated;
grant select on table public.family_invites to authenticated;

-- 参加の直 INSERT はオーナー本人の初回所属だけ。招待の参加は approve_family_invite が行う。
drop policy "users can join families" on family_members;

create policy "owner can add self as first member"
  on family_members for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from families
      where families.id = family_members.family_id
        and families.owner_id = auth.uid()
    )
  );

create or replace function is_permanent_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

create or replace function family_member_limit()
returns integer
language sql
immutable
security definer
set search_path = public, pg_temp
as $$
  select 6;
$$;

create or replace function create_family_invite(
  p_family_id uuid,
  p_invited_email text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_family_id uuid;
  v_invite_id uuid;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  if not is_permanent_user() then
    raise exception 'GUEST_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  v_email := lower(trim(p_invited_email));
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+$' then
    raise exception 'INVALID_EMAIL' using errcode = 'P0001';
  end if;

  select id into v_family_id
  from families
  where id = p_family_id
    and owner_id = auth.uid()
  for update;

  if v_family_id is null then
    raise exception 'NOT_OWNER' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from family_invites
    where family_id = p_family_id
      and invited_email = v_email
      and revoked_at is null
      and used_at is null
      and expires_at > now()
  ) then
    raise exception 'DUPLICATE_ACTIVE_INVITE' using errcode = 'P0001';
  end if;

  insert into family_invites (
    family_id,
    invited_email,
    created_by,
    expires_at
  )
  values (
    p_family_id,
    v_email,
    auth.uid(),
    now() + interval '1 day'
  )
  returning id into v_invite_id;

  return v_invite_id;
end;
$$;

create or replace function cancel_family_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invite family_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  if not is_permanent_user() then
    raise exception 'GUEST_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select * into v_invite
  from family_invites
  where id = p_invite_id
  for update;

  if not found then
    raise exception 'INVITE_NOT_USABLE' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from families
    where id = v_invite.family_id
      and owner_id = auth.uid()
  ) then
    raise exception 'NOT_OWNER' using errcode = 'P0001';
  end if;

  if v_invite.used_at is not null then
    raise exception 'INVITE_ALREADY_USED' using errcode = 'P0001';
  end if;

  if v_invite.revoked_at is not null then
    raise exception 'INVITE_REVOKED' using errcode = 'P0001';
  end if;

  if v_invite.expires_at <= now() then
    raise exception 'INVITE_EXPIRED' using errcode = 'P0001';
  end if;

  update family_invites
  set revoked_at = now()
  where id = p_invite_id;
end;
$$;

create or replace function approve_family_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_confirmed timestamptz;
  v_invite family_invites%rowtype;
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  if not is_permanent_user() then
    raise exception 'GUEST_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select email, email_confirmed_at
    into v_email, v_confirmed
  from auth.users
  where id = auth.uid();

  if v_confirmed is null then
    raise exception 'EMAIL_NOT_CONFIRMED' using errcode = 'P0001';
  end if;

  -- 同じ人の承認を直列にし、所属の確認と追加の間に別招待が通らないようにする。
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  if exists (
    select 1 from family_members where user_id = auth.uid()
  ) then
    raise exception 'ALREADY_IN_FAMILY' using errcode = 'P0001';
  end if;

  select * into v_invite
  from family_invites
  where id = p_invite_id
  for update;

  if not found
    or v_email is null
    or lower(v_invite.invited_email) <> lower(v_email) then
    raise exception 'INVITE_NOT_USABLE' using errcode = 'P0001';
  end if;

  if v_invite.revoked_at is not null then
    raise exception 'INVITE_REVOKED' using errcode = 'P0001';
  end if;

  if v_invite.used_at is not null then
    raise exception 'INVITE_ALREADY_USED' using errcode = 'P0001';
  end if;

  if v_invite.expires_at <= now() then
    raise exception 'INVITE_EXPIRED' using errcode = 'P0001';
  end if;

  perform 1
  from families
  where id = v_invite.family_id
  for update;

  select count(*)::integer into v_count
  from family_members
  where family_id = v_invite.family_id;

  if v_count >= family_member_limit() then
    raise exception 'FAMILY_MEMBER_LIMIT' using errcode = 'P0001';
  end if;

  insert into family_members (family_id, user_id)
  values (v_invite.family_id, auth.uid());

  update family_invites
  set used_by = auth.uid(),
      used_at = now()
  where id = v_invite.id;
end;
$$;

create or replace function list_my_family_invites()
returns table (
  id uuid,
  family_name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  if not is_permanent_user() then
    raise exception 'GUEST_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  return query
  select family_invites.id, families.name, family_invites.expires_at
  from family_invites
  join families on families.id = family_invites.family_id
  join auth.users on auth.users.id = auth.uid()
  where family_invites.revoked_at is null
    and family_invites.used_at is null
    and family_invites.expires_at > now()
    and lower(family_invites.invited_email) = lower(auth.users.email);
end;
$$;

revoke all on function public.is_permanent_user() from public, anon;
revoke all on function public.family_member_limit() from public, anon;
revoke all on function public.create_family_invite(uuid, text) from public, anon;
revoke all on function public.cancel_family_invite(uuid) from public, anon;
revoke all on function public.approve_family_invite(uuid) from public, anon;
revoke all on function public.list_my_family_invites() from public, anon;

grant execute on function public.is_permanent_user() to authenticated;
grant execute on function public.family_member_limit() to authenticated;
grant execute on function public.create_family_invite(uuid, text) to authenticated;
grant execute on function public.cancel_family_invite(uuid) to authenticated;
grant execute on function public.approve_family_invite(uuid) to authenticated;
grant execute on function public.list_my_family_invites() to authenticated;
