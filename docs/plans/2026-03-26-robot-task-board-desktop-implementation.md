# Robot Task Board Desktop Delivery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing web-first task board into a Windows-first desktop product that members can install, open from the desktop, and use immediately with minimal setup.

**Architecture:** Keep the current Next.js + Supabase application as the cloud-hosted source of truth, then add a Tauri-based Windows desktop shell around it. Deliver the missing product layer through a fixed service endpoint, persistent desktop session behavior, an admin-only first-run wizard, and installer/update support.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase, Tauri v2, Rust, Vitest, Playwright

---

## Current Repository Context

- The current repository already contains a working Web MVP
- The existing app already supports login, task boards, project boards, and admin management
- There is no `src-tauri/` directory yet
- There is no Windows installer pipeline yet
- There is no admin first-run wizard yet

The implementation focus is now delivery shape and onboarding experience, not rebuilding the core business model.

## Task 1: Add desktop runtime configuration and Tauri workspace scaffolding

**Files:**
- Create: `src/lib/desktop/runtime-config.ts`
- Create: `tests/unit/runtime-config.test.ts`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/icons/`
- Modify: `package.json`
- Modify: `.gitignore`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { parseDesktopRuntimeConfiguration } from "@/lib/desktop/runtime-config";

describe("parseDesktopRuntimeConfiguration", () => {
  it("accepts a fixed remote service URL for desktop builds", () => {
    expect(
      parseDesktopRuntimeConfiguration({
        NEXT_PUBLIC_DESKTOP_APP_URL: "https://task-board.example.com",
      }),
    ).toEqual({
      appUrl: "https://task-board.example.com",
    });
  });

  it("rejects invalid desktop service URLs", () => {
    expect(() =>
      parseDesktopRuntimeConfiguration({
        NEXT_PUBLIC_DESKTOP_APP_URL: "not-a-url",
      }),
    ).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/runtime-config.test.ts`
Expected: FAIL because the parser does not exist.

**Step 3: Write minimal implementation**

- Add a typed desktop runtime parser for a fixed remote app URL
- Add Tauri v2 workspace files
- Add `package.json` scripts such as:
  - `tauri:dev`
  - `tauri:build`
- Configure Tauri to load the deployed web app URL in production-like desktop runs
- Add Windows metadata placeholders for app name and icon

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/runtime-config.test.ts`
Expected: PASS

**Step 5: Verify Tauri scaffolding**

Run: `npm run tauri:build -- --debug`
Expected: Tauri workspace compiles and produces a debug desktop bundle.

**Step 6: Commit**

```bash
git add package.json .gitignore src/lib/desktop/runtime-config.ts tests/unit/runtime-config.test.ts src-tauri
git commit -m "feat: add tauri desktop workspace scaffolding"
```

## Task 2: Introduce desktop shell detection and device-like session behavior

**Files:**
- Create: `src/lib/desktop/is-desktop-client.ts`
- Create: `src/components/desktop/desktop-shell-hints.tsx`
- Create: `tests/unit/is-desktop-client.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/(auth)/login/page.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { isDesktopClientUserAgent } from "@/lib/desktop/is-desktop-client";

describe("isDesktopClientUserAgent", () => {
  it("detects the desktop shell user agent marker", () => {
    expect(isDesktopClientUserAgent("RobotTaskBoardDesktop/1.0")).toBe(true);
  });

  it("does not classify normal browsers as desktop shell", () => {
    expect(isDesktopClientUserAgent("Mozilla/5.0 Chrome/136.0")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/is-desktop-client.test.ts`
Expected: FAIL because the helper does not exist.

**Step 3: Write minimal implementation**

- Add a shared helper to detect the desktop runtime marker
- Update the login page copy for desktop users:
  - less browser-oriented
  - more app-oriented
- Update the authenticated shell to show desktop-specific hints only inside the Tauri shell
- Keep browser access working for development and fallback use

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/is-desktop-client.test.ts`
Expected: PASS

**Step 5: Run targeted regression checks**

Run: `npm run test -- tests/unit/app-shell.test.tsx tests/unit/welcome-landing.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/desktop/is-desktop-client.ts src/components/desktop/desktop-shell-hints.tsx src/app/layout.tsx src/components/app-shell.tsx src/app/(auth)/login/page.tsx tests/unit/is-desktop-client.test.ts
git commit -m "feat: adapt shell and login flow for desktop runtime"
```

## Task 3: Build admin-only first-run initialization wizard

**Files:**
- Create: `src/app/(app)/setup/page.tsx`
- Create: `src/features/setup/setup-schema.ts`
- Create: `src/features/setup/actions.ts`
- Create: `src/features/setup/get-setup-state.ts`
- Create: `src/components/setup/setup-wizard.tsx`
- Create: `src/components/setup/team-basics-step.tsx`
- Create: `src/components/setup/project-template-step.tsx`
- Create: `src/components/setup/member-import-step.tsx`
- Create: `tests/unit/setup-schema.test.ts`
- Modify: `src/app/(app)/admin/page.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { setupWizardSchema } from "@/features/setup/setup-schema";

describe("setupWizardSchema", () => {
  it("accepts a valid first-run initialization payload", () => {
    expect(
      setupWizardSchema.parse({
        teamName: "Oh My Robot",
        seasonName: "2026 赛季",
        projects: [{ name: "英雄机器人", description: "" }],
        members: [{ displayName: "Alice", email: "alice@example.com" }],
      }),
    ).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/setup-schema.test.ts`
Expected: FAIL because the setup schema and wizard do not exist.

**Step 3: Write minimal implementation**

- Add a dedicated `/setup` route
- Add admin-only gating:
  - only admins can use setup
  - if projects already exist, redirect away from setup
- Implement the 4-step wizard:
  - team basics
  - initial projects
  - subsystem template generation
  - member import
- The submit action should create:
  - projects
  - default subsystems
  - user profiles and auth users for members

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/setup-schema.test.ts`
Expected: PASS

**Step 5: Run targeted behavior verification**

Run: `npm run test -- tests/unit/permissions.test.ts tests/unit/env.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/(app)/setup/page.tsx src/features/setup src/components/setup tests/unit/setup-schema.test.ts src/app/(app)/admin/page.tsx src/app/page.tsx
git commit -m "feat: add admin first-run setup wizard"
```

## Task 4: Redirect empty admin systems into the setup flow

**Files:**
- Create: `tests/e2e/setup-wizard.spec.ts`
- Modify: `src/app/(app)/admin/page.tsx`
- Modify: `src/features/admin/get-admin-console.ts`
- Modify: `middleware.ts`

**Step 1: Write the failing test**

```ts
import { expect, test } from "@playwright/test";

test("admin is redirected to setup when the system has no projects", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/setup$/);
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/setup-wizard.spec.ts`
Expected: FAIL because the redirect behavior does not exist.

**Step 3: Write minimal implementation**

- Expose a lightweight “is initialized” check from admin data loading
- Redirect admin users to `/setup` when:
  - they are authenticated
  - they are admins
  - the system has no project records yet
- Prevent members from accessing `/setup`

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/setup-wizard.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/setup-wizard.spec.ts src/app/(app)/admin/page.tsx src/features/admin/get-admin-console.ts middleware.ts
git commit -m "feat: route empty admin systems into setup wizard"
```

## Task 5: Polish desktop-first onboarding and remove remaining web-only mental models

**Files:**
- Create: `src/components/desktop/network-status-banner.tsx`
- Create: `src/components/desktop/update-status-banner.tsx`
- Create: `tests/unit/network-status-banner.test.tsx`
- Modify: `src/features/home/welcome-landing.tsx`
- Modify: `src/components/pwa-install-prompt.tsx`
- Modify: `README.md`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { NetworkStatusBanner } from "@/components/desktop/network-status-banner";

test("renders offline warning when desktop app loses connectivity", () => {
  render(<NetworkStatusBanner isOnline={false} />);

  expect(screen.getByText("当前无法连接任务中枢")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/network-status-banner.test.tsx`
Expected: FAIL because the banner component does not exist.

**Step 3: Write minimal implementation**

- Replace or reduce PWA-oriented installation prompts in desktop-specific contexts
- Add desktop-oriented network status messaging
- Add update status placeholder UI
- Update welcome page copy so the default user story is:
  - install desktop app
  - open desktop app
  - sign in once

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/network-status-banner.test.tsx`
Expected: PASS

**Step 5: Run targeted regression checks**

Run: `npm run test -- tests/unit/welcome-landing.test.tsx tests/unit/pwa-install-prompt.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/desktop src/features/home/welcome-landing.tsx src/components/pwa-install-prompt.tsx README.md tests/unit/network-status-banner.test.tsx
git commit -m "feat: polish desktop-first onboarding and status messaging"
```

## Task 6: Add Tauri updater integration and Windows packaging flow

**Files:**
- Create: `src-tauri/updater.conf.json`
- Create: `src-tauri/src/updater.rs`
- Create: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/main.rs`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `package.json`
- Modify: `README.md`

**Step 1: Write the failing verification**

There is no good unit test for packaging. Start with a compile-level verification target.

Run: `npm run tauri:build -- --debug`
Expected: FAIL because updater integration and packaging settings are incomplete.

**Step 2: Write minimal implementation**

- Add Tauri updater plugin wiring
- Configure Windows bundle metadata
- Configure installer generation
- Expose a minimal updater status bridge to the frontend
- Document how release artifacts are produced

**Step 3: Run verification**

Run: `npm run tauri:build -- --debug`
Expected: PASS and produce a Windows bundle artifact.

**Step 4: Commit**

```bash
git add src-tauri package.json README.md
git commit -m "feat: add tauri updater and windows packaging flow"
```

## Task 7: Final acceptance, documentation, and operator handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-03-26-robot-task-board-desktop-design.md`
- Modify: `docs/plans/2026-03-26-robot-task-board-desktop-implementation.md`
- Create: `tests/e2e/desktop-entry.spec.ts`

**Step 1: Write the failing test**

```ts
import { expect, test } from "@playwright/test";

test("unauthenticated desktop user can enter login from the welcome landing", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "进入任务面板" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
```

**Step 2: Run test to verify it fails only if the product entry path is broken**

Run: `npx playwright test tests/e2e/desktop-entry.spec.ts`
Expected: PASS after the desktop-first onboarding work is complete.

**Step 3: Finalize documentation**

- Update README with:
  - Windows installer flow
  - admin deployment responsibilities
  - member installation and login flow
  - build and release commands
- Update the design doc with any implementation-driven adjustments
- Update the implementation plan status

**Step 4: Run the full verification suite**

Run: `npm run test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build`
Expected: PASS

Run: `npx playwright test`
Expected: PASS

Run: `npm run tauri:build -- --debug`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/plans tests/e2e
git commit -m "docs: finalize desktop delivery handoff"
```

## Manual Acceptance Checklist

- A Windows user can install the desktop app and see a desktop icon
- Opening the app does not require the user to understand URLs or browser installation flows
- A member signs in once and remains signed in across relaunches
- An admin with an empty system is sent to the setup wizard automatically
- The setup wizard can create projects, default subsystems, and member accounts
- Normal members never see setup-only controls
- The cloud service remains the only source of truth for business data
- The existing task board and project board continue working after desktop integration

## Operator Deployment Notes

- The administrator remains responsible for deploying the cloud service once
- Desktop builds must embed the correct environment URL for the target environment
- Service role credentials must remain on the server side only
- Production releases should publish signed Windows installers whenever possible

## Suggested Execution Order

1. Task 1 and Task 2 to establish the desktop shell baseline
2. Task 3 and Task 4 to add first-run onboarding
3. Task 5 to remove remaining web-only user experience assumptions
4. Task 6 for packaging and updater support
5. Task 7 for full verification and operator handoff
