# Robot Team Task Board Implementation Plan

## Current Execution Status

- Repository implementation is using `npm`, not `pnpm`
- Tasks 1 through 8 are already delivered in the current workspace
- Remaining work is polish and documentation hardening
- The current MVP already includes:
  - login and protected routes
  - personal dashboard
  - projects list and project board
  - task create / edit / status flow
  - admin management for members, projects, subsystems, and milestones

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a low-maintenance online task board for a 6-8 person robotics competition team with individual accounts, project-centric organization, subsystem grouping, milestones, task relations, and a personal dashboard.

**Architecture:** Use a Next.js App Router application deployed on Vercel, with Supabase providing Auth and PostgreSQL. Keep all write operations in server actions or route handlers, store role and profile data in application tables, and model collaboration as related single-owner tasks plus separate integration tasks.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, Vitest, Playwright, pnpm

---

## Implementation Decisions

- Use `pnpm` as the package manager
- Use Next.js App Router with TypeScript
- Use server-side rendered authenticated pages
- Use email/password login with email confirmation disabled
- Use one `admin` role and one `member` role in `user_profiles`
- Do not implement drag-and-drop in MVP
- Do not implement comments, attachments, notifications, or gantt charts in MVP

## Target Repository Layout

```text
.
├─ docs/plans/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (app)/layout.tsx
│  │  ├─ (app)/my-tasks/page.tsx
│  │  ├─ (app)/projects/page.tsx
│  │  ├─ (app)/projects/[projectId]/page.tsx
│  │  ├─ (app)/admin/page.tsx
│  │  ├─ api/
│  │  └─ globals.css
│  ├─ components/
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ projects/
│  │  ├─ tasks/
│  │  └─ admin/
│  ├─ lib/
│  │  ├─ env.ts
│  │  ├─ auth/
│  │  ├─ db/
│  │  ├─ permissions.ts
│  │  └─ validators/
│  └─ types/
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ tests/
│  ├─ unit/
│  └─ e2e/
└─ middleware.ts
```

## Task 1: Bootstrap the application and test harness

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `tests/unit/app-shell.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

test("renders application shell title", () => {
  render(
    <RootLayout>
      <div>child</div>
    </RootLayout>
  );

  expect(screen.getByText("Robot Task Board")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/app-shell.test.tsx`
Expected: FAIL because the app scaffold and layout do not exist yet.

**Step 3: Write minimal implementation**

- Initialize a Next.js TypeScript app with Tailwind CSS
- Add path alias support for `@/*`
- Add a root layout with the application title `Robot Task Board`
- Add a temporary root page that redirects authenticated users later

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/app-shell.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap task board app"
```

## Task 2: Add environment validation and Supabase clients

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Test: `tests/unit/env.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { parseEnvironment } from "@/lib/env";

describe("parseEnvironment", () => {
  it("throws when required variables are missing", () => {
    expect(() =>
      parseEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      })
    ).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/env.test.ts`
Expected: FAIL because `parseEnvironment` does not exist.

**Step 3: Write minimal implementation**

- Add `parseEnvironment` using Zod
- Create browser, server, and admin Supabase client factories
- Document required variables in `.env.example`

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/env.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add env validation and supabase clients"
```

## Task 3: Create the database schema and seed data

**Files:**
- Create: `supabase/migrations/202603250001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/types/database.ts`
- Test: `tests/unit/permissions.test.ts`

**Step 1: Write the failing test**

```ts
import { canManageProjects, canMutateTask } from "@/lib/permissions";

test("member cannot manage projects", () => {
  expect(canManageProjects("member")).toBe(false);
});

test("assignee can update task status", () => {
  expect(
    canMutateTask({
      actorId: "user-1",
      actorRole: "member",
      assigneeId: "user-1",
      creatorId: "user-2",
    })
  ).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/permissions.test.ts`
Expected: FAIL because permissions helpers and schema types do not exist.

**Step 3: Write minimal implementation**

Create the schema below in `supabase/migrations/202603250001_initial_schema.sql`:

```sql
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  status text not null check (status in ('planning', 'active', 'archived')),
  start_date date,
  target_date date,
  created_at timestamptz not null default now()
);

create table subsystems (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(project_id, name)
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null check (status in ('pending', 'active', 'completed')),
  due_date date,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  subsystem_id uuid not null references subsystems(id) on delete restrict,
  milestone_id uuid references milestones(id) on delete set null,
  assignee_id uuid not null references user_profiles(id) on delete restrict,
  creator_id uuid not null references user_profiles(id) on delete restrict,
  title text not null,
  description text not null default '',
  status text not null check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  group_tag text not null,
  is_integration_task boolean not null default false,
  blocked_reason text not null default '',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_relations (
  id uuid primary key default gen_random_uuid(),
  source_task_id uuid not null references tasks(id) on delete cascade,
  target_task_id uuid not null references tasks(id) on delete cascade,
  relation_type text not null check (relation_type in ('depends_on', 'related_to', 'integration_input')),
  created_at timestamptz not null default now(),
  unique(source_task_id, target_task_id, relation_type)
);
```

Also add:

- `updated_at` trigger for `tasks`
- RLS for authenticated read access
- Insert/update rules that restrict task mutation to admins, creators, or assignees
- Seed data with one admin, three members, one sample robot project, sample subsystems, sample milestone, and sample tasks

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/permissions.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add database schema and seed data"
```

## Task 4: Implement login, session guards, and app shell

**Files:**
- Create: `middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/actions.ts`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/app-shell.tsx`
- Create: `src/components/navigation.tsx`
- Create: `src/lib/auth/get-session-user.ts`
- Modify: `src/app/page.tsx`
- Test: `tests/e2e/login.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("redirects unauthenticated user to login", async ({ page }) => {
  await page.goto("/my-tasks");
  await expect(page).toHaveURL(/login/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/login.spec.ts`
Expected: FAIL because auth routing and middleware are not implemented.

**Step 3: Write minimal implementation**

- Add middleware that redirects unauthenticated users from app routes to `/login`
- Build the login page with email/password form
- Add a server action for sign-in
- Add the authenticated shell with:
  - Logo/title
  - `我的任务`
  - `项目`
  - `管理` for admin only
  - User menu and sign-out
- Redirect `/` to `/my-tasks` when logged in, else `/login`

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/login.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add auth flow and protected app shell"
```

## Task 5: Build the personal dashboard (`我的任务`)

**Files:**
- Create: `src/app/(app)/my-tasks/page.tsx`
- Create: `src/features/dashboard/get-my-task-dashboard.ts`
- Create: `src/components/task-status-column.tsx`
- Create: `src/components/task-card.tsx`
- Create: `src/components/upcoming-deadlines.tsx`
- Create: `src/components/blocked-task-list.tsx`
- Test: `tests/e2e/my-tasks.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("member sees personal task columns", async ({ page }) => {
  await loginAsMember(page);
  await page.goto("/my-tasks");

  await expect(page.getByText("待开始")).toBeVisible();
  await expect(page.getByText("进行中")).toBeVisible();
  await expect(page.getByText("阻塞")).toBeVisible();
  await expect(page.getByText("已完成")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/my-tasks.spec.ts`
Expected: FAIL because the dashboard page does not exist.

**Step 3: Write minimal implementation**

- Query tasks where `assignee_id` equals current user
- Group tasks into four status columns
- Add side panels for upcoming deadlines and blocked tasks
- Show milestone name and project name on each task card
- Use explicit buttons or a status menu, not drag-and-drop

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/my-tasks.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add personal task dashboard"
```

## Task 6: Build projects list and project board

**Files:**
- Create: `src/app/(app)/projects/page.tsx`
- Create: `src/app/(app)/projects/[projectId]/page.tsx`
- Create: `src/features/projects/get-project-list.ts`
- Create: `src/features/projects/get-project-board.ts`
- Create: `src/components/project-card.tsx`
- Create: `src/components/project-overview.tsx`
- Create: `src/components/project-task-board.tsx`
- Create: `src/components/project-filters.tsx`
- Test: `tests/e2e/project-board.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("project board highlights blocked and integration tasks", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/projects/sample-project-id");

  await expect(page.getByText("联调任务")).toBeVisible();
  await expect(page.getByText("阻塞任务")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/project-board.spec.ts`
Expected: FAIL because the projects pages do not exist.

**Step 3: Write minimal implementation**

- Add `/projects` list page with counts:
  - milestones
  - open tasks
  - blocked tasks
- Add project board page with:
  - project summary
  - milestone progress
  - task board grouped by status
  - filters for subsystem, assignee, priority, status
  - visual treatment for integration tasks and blocked tasks

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/project-board.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add project list and project board"
```

## Task 7: Implement task create, edit, relation, and status update flows

**Files:**
- Create: `src/features/tasks/task-form-schema.ts`
- Create: `src/features/tasks/actions.ts`
- Create: `src/components/task-form.tsx`
- Create: `src/components/task-relation-picker.tsx`
- Create: `src/components/task-status-menu.tsx`
- Modify: `src/app/(app)/my-tasks/page.tsx`
- Modify: `src/app/(app)/projects/[projectId]/page.tsx`
- Test: `tests/e2e/task-mutation.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("member can create a task inside an existing project", async ({ page }) => {
  await loginAsMember(page);
  await page.goto("/projects/sample-project-id");
  await page.getByRole("button", { name: "新建任务" }).click();
  await page.getByLabel("标题").fill("完成云台串口协议接入");
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("完成云台串口协议接入")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/task-mutation.spec.ts`
Expected: FAIL because task mutation flows are not implemented.

**Step 3: Write minimal implementation**

- Add shared Zod schema for task create/edit forms
- Create server actions for:
  - create task
  - update task
  - update status
  - create task relation
- Enforce rules:
  - member can create task only under existing project and subsystem
  - member can edit task only if creator or assignee
  - member can change status only if assignee
  - admin can mutate any task
- Allow marking `is_integration_task`
- Show `blocked_reason` field only when status is `blocked`

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/task-mutation.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add task creation and update flows"
```

## Task 8: Build the admin management page

**Files:**
- Create: `src/app/(app)/admin/page.tsx`
- Create: `src/features/admin/actions.ts`
- Create: `src/components/admin/user-management.tsx`
- Create: `src/components/admin/project-management.tsx`
- Create: `src/components/admin/subsystem-management.tsx`
- Create: `src/components/admin/milestone-management.tsx`
- Test: `tests/e2e/admin.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("member cannot access admin page", async ({ page }) => {
  await loginAsMember(page);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin$/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/admin.spec.ts`
Expected: FAIL because role protection and admin page are not implemented.

**Step 3: Write minimal implementation**

- Build admin-only page sections for:
  - user list and invite/create member
  - project CRUD
  - subsystem CRUD
  - milestone CRUD
- Use admin Supabase client only in server actions that require service role:
  - create auth users
  - reset user password
  - disable account
- Redirect non-admin users away from `/admin`

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/admin.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin management console"
```

## Task 9: Add polish, validation, and deployment documentation

**Files:**
- Create: `README.md`
- Create: `.env.example`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `docs/plans/2026-03-25-robot-task-board-design.md`
- Modify: `docs/plans/2026-03-25-robot-task-board-implementation.md`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("authenticated user can complete the happy path", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/projects");
  await expect(page.getByText("项目")).toBeVisible();
  await page.goto("/my-tasks");
  await expect(page.getByText("我的任务")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/smoke.spec.ts`
Expected: FAIL until all primary routes and auth flow are wired together.

**Step 3: Write minimal implementation**

- Add final empty, loading, and error states
- Add README with:
  - local setup
  - Supabase setup
  - environment variables
  - seeding
  - deployment to Vercel
- Add `.env.example`
- Verify route guards and role guards across all pages

**Step 4: Run test to verify it passes**

Run: `pnpm vitest`
Expected: PASS

Run: `pnpm playwright test`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "docs: add setup guide and verification coverage"
```

## Manual Acceptance Checklist

- Admin can create projects, subsystems, milestones, and members
- Member lands on `我的任务` after login
- Member sees only one personal dashboard, not an admin console
- Member can create a task under an existing project and subsystem
- Member can update status on their own assigned tasks
- Cross-group work is represented by multiple related tasks and one integration task
- Project page shows milestone progress, blocked tasks, and integration tasks
- Admin can view all tasks across projects
- System works on desktop and mobile widths without drag-and-drop

## Deployment Notes

- Create one Supabase project for production and one for development
- Disable email confirmation in Supabase Auth settings
- Store Vercel environment variables for Supabase URL, anon key, and service role key
- Run migrations before the first Vercel deployment
- Seed only development, not production

## Suggested Execution Order

1. Task 1 through Task 3 to establish the platform baseline
2. Task 4 to make authentication and protected routing usable
3. Task 5 through Task 7 to deliver the member-facing MVP
4. Task 8 for admin workflows
5. Task 9 for hardening and deployment readiness
