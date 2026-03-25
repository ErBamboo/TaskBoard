create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  status text not null default 'planning' check (status in ('planning', 'active', 'archived')),
  start_date date,
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.subsystems (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  subsystem_id uuid not null references public.subsystems (id) on delete restrict,
  milestone_id uuid references public.milestones (id) on delete set null,
  assignee_id uuid not null references public.user_profiles (id) on delete restrict,
  creator_id uuid not null references public.user_profiles (id) on delete restrict,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  group_tag text not null,
  is_integration_task boolean not null default false,
  blocked_reason text not null default '',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_relations (
  id uuid primary key default gen_random_uuid(),
  source_task_id uuid not null references public.tasks (id) on delete cascade,
  target_task_id uuid not null references public.tasks (id) on delete cascade,
  relation_type text not null check (relation_type in ('depends_on', 'related_to', 'integration_input')),
  created_at timestamptz not null default now(),
  unique (source_task_id, target_task_id, relation_type)
);

create index if not exists idx_subsystems_project_id on public.subsystems (project_id);
create index if not exists idx_milestones_project_id on public.milestones (project_id);
create index if not exists idx_tasks_project_id_status on public.tasks (project_id, status);
create index if not exists idx_tasks_assignee_id_status on public.tasks (assignee_id, status);
create index if not exists idx_tasks_milestone_id on public.tasks (milestone_id);
create index if not exists idx_task_relations_source_task_id on public.task_relations (source_task_id);
create index if not exists idx_task_relations_target_task_id on public.task_relations (target_task_id);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.user_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.subsystems enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.task_relations enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.user_profiles;
create policy "Authenticated users can read profiles"
on public.user_profiles
for select
to authenticated
using (true);

drop policy if exists "Admins manage profiles" on public.user_profiles;
create policy "Admins manage profiles"
on public.user_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read projects" on public.projects;
create policy "Authenticated users can read projects"
on public.projects
for select
to authenticated
using (true);

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read subsystems" on public.subsystems;
create policy "Authenticated users can read subsystems"
on public.subsystems
for select
to authenticated
using (true);

drop policy if exists "Admins manage subsystems" on public.subsystems;
create policy "Admins manage subsystems"
on public.subsystems
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read milestones" on public.milestones;
create policy "Authenticated users can read milestones"
on public.milestones
for select
to authenticated
using (true);

drop policy if exists "Admins manage milestones" on public.milestones;
create policy "Admins manage milestones"
on public.milestones
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read tasks" on public.tasks;
create policy "Authenticated users can read tasks"
on public.tasks
for select
to authenticated
using (true);

drop policy if exists "Admins and members can create tasks" on public.tasks;
create policy "Admins and members can create tasks"
on public.tasks
for insert
to authenticated
with check (
  public.is_admin()
  or (
    creator_id = auth.uid()
    and exists (
      select 1
      from public.user_profiles
      where id = assignee_id
        and is_active = true
    )
  )
);

drop policy if exists "Admins and responsible members can update tasks" on public.tasks;
create policy "Admins and responsible members can update tasks"
on public.tasks
for update
to authenticated
using (
  public.is_admin()
  or creator_id = auth.uid()
  or assignee_id = auth.uid()
)
with check (
  public.is_admin()
  or creator_id = auth.uid()
  or assignee_id = auth.uid()
);

drop policy if exists "Only admins can delete tasks" on public.tasks;
create policy "Only admins can delete tasks"
on public.tasks
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Authenticated users can read task relations" on public.task_relations;
create policy "Authenticated users can read task relations"
on public.task_relations
for select
to authenticated
using (true);

drop policy if exists "Admins and task owners can create relations" on public.task_relations;
create policy "Admins and task owners can create relations"
on public.task_relations
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.tasks
    where id = source_task_id
      and (creator_id = auth.uid() or assignee_id = auth.uid())
  )
);

drop policy if exists "Only admins can modify relations" on public.task_relations;
create policy "Only admins can modify relations"
on public.task_relations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Only admins can delete relations" on public.task_relations;
create policy "Only admins can delete relations"
on public.task_relations
for delete
to authenticated
using (public.is_admin());
