insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@robot.lab',
    crypt('robot-admin-123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Team Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222221',
    'authenticated',
    'authenticated',
    'mech@robot.lab',
    crypt('robot-member-123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Mechanical Lead"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'algo@robot.lab',
    crypt('robot-member-123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Algorithm Lead"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222223',
    'authenticated',
    'authenticated',
    'embedded@robot.lab',
    crypt('robot-member-123', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Embedded Lead"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into public.user_profiles (id, email, display_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@robot.lab', 'Team Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222221', 'mech@robot.lab', 'Mechanical Lead', 'member'),
  ('22222222-2222-2222-2222-222222222222', 'algo@robot.lab', 'Algorithm Lead', 'member'),
  ('22222222-2222-2222-2222-222222222223', 'embedded@robot.lab', 'Embedded Lead', 'member')
on conflict (id) do nothing;

insert into public.projects (id, name, description, status, start_date, target_date)
values (
  '33333333-3333-3333-3333-333333333333',
  'Hero Robot 2026',
  'Main competition robot for season testing and integration.',
  'active',
  current_date,
  current_date + interval '60 day'
)
on conflict (id) do nothing;

insert into public.subsystems (id, project_id, name, description, sort_order)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333333',
    'Chassis',
    'Mechanical and motion control work.',
    1
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333333',
    'Vision',
    'Perception and targeting algorithms.',
    2
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    'Embedded',
    'Board communication and firmware integration.',
    3
  )
on conflict (id) do nothing;

insert into public.milestones (id, project_id, name, description, status, due_date)
values (
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  'First Full Integration',
  'Reach the first cross-subsystem integration checkpoint.',
  'active',
  current_date + interval '21 day'
)
on conflict (id) do nothing;

insert into public.tasks (
  id,
  project_id,
  subsystem_id,
  milestone_id,
  assignee_id,
  creator_id,
  title,
  description,
  status,
  priority,
  group_tag,
  is_integration_task,
  blocked_reason,
  due_at
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444441',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Finalize chassis mounting bracket',
    'Deliver the updated bracket for motor controller placement.',
    'in_progress',
    'high',
    'mechanical',
    false,
    '',
    now() + interval '5 day'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444442',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Validate target recognition model',
    'Run indoor validation on the current camera parameters.',
    'todo',
    'urgent',
    'algorithm',
    false,
    '',
    now() + interval '4 day'
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444443',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Integrate vision serial protocol',
    'Complete firmware handling for the vision output frame.',
    'blocked',
    'high',
    'embedded',
    false,
    'Waiting on stable protocol fields from algorithm team.',
    now() + interval '6 day'
  ),
  (
    '66666666-6666-6666-6666-666666666664',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444443',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'First full-chain integration run',
    'Run the first chassis + vision + embedded integration checklist.',
    'todo',
    'urgent',
    'integration',
    true,
    '',
    now() + interval '8 day'
  )
on conflict (id) do nothing;

insert into public.task_relations (id, source_task_id, target_task_id, relation_type)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '66666666-6666-6666-6666-666666666663',
    '66666666-6666-6666-6666-666666666662',
    'depends_on'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '66666666-6666-6666-6666-666666666664',
    '66666666-6666-6666-6666-666666666661',
    'integration_input'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    '66666666-6666-6666-6666-666666666664',
    '66666666-6666-6666-6666-666666666662',
    'integration_input'
  ),
  (
    '77777777-7777-7777-7777-777777777774',
    '66666666-6666-6666-6666-666666666664',
    '66666666-6666-6666-6666-666666666663',
    'integration_input'
  )
on conflict (id) do nothing;
