create table if not exists public.team_settings (
  id smallint primary key default 1 check (id = 1),
  team_name text not null,
  season_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_team_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists team_settings_set_updated_at on public.team_settings;
create trigger team_settings_set_updated_at
before update on public.team_settings
for each row
execute function public.set_team_settings_updated_at();

alter table public.team_settings enable row level security;

drop policy if exists "Authenticated users can read team settings" on public.team_settings;
create policy "Authenticated users can read team settings"
on public.team_settings
for select
to authenticated
using (true);

drop policy if exists "Admins manage team settings" on public.team_settings;
create policy "Admins manage team settings"
on public.team_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
