create table profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  avatar_icon  text        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(trim(display_name)) between 1 and 30),
  constraint profiles_avatar_icon_allowed
    check (avatar_icon in (
      'chef-hat',
      'utensils',
      'heart',
      'home',
      'smile',
      'user',
      'coffee',
      'leaf'
    ))
);

create trigger set_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

alter table profiles enable row level security;

create policy "users can select own or same family profiles"
  on profiles for select
  using (id = auth.uid() or is_same_family(id));

create policy "users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "users can update own profile"
  on profiles for update
  using (id = auth.uid());
