import type { ReactNode } from "react";

import { headers } from "next/headers";

import type { SessionUser } from "@/lib/auth/get-session-user";
import { Navigation } from "@/components/navigation";
import { DesktopShellHints } from "@/components/desktop/desktop-shell-hints";
import {
  getDesktopClientVersionFromUserAgent,
  isDesktopClientUserAgent,
} from "@/lib/desktop/is-desktop-client";

import { CommandBar } from "@/components/command-bar";

type AppShellProperties = {
  children: ReactNode;
  signOutAction: () => Promise<void>;
  user: SessionUser;
};

export async function AppShell({
  children,
  signOutAction,
  user,
}: AppShellProperties) {
  const headersStore = await headers();
  const userAgent = headersStore.get("user-agent");
  const isDesktopClient = isDesktopClientUserAgent(
    userAgent,
  );
  const clientVersion = getDesktopClientVersionFromUserAgent(userAgent);

  return (
    <div className="min-h-screen">
      <CommandBar />
      <div className="sticky top-0 z-50 border-b border-[var(--color-line-strong)] bg-[rgba(243,239,229,0.92)] shadow-[0_4px_24px_-12px_var(--color-shadow)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 lg:px-10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="space-y-2">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-[var(--color-muted)]">
                Robotics Internal Command Surface
              </p>
              <div className="flex flex-wrap items-end gap-4">
                <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.14em] text-[var(--color-ink)]">
                  Robot Task Board
                </h1>
                <p className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Team-only console
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-[var(--color-line-strong)] bg-[var(--color-panel)] p-4 shadow-[6px_6px_0_var(--color-shadow)] sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Signed in
                </p>
                <p className="mt-1 text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
                  {user.displayName}
                </p>
                <p className="text-sm text-[var(--color-muted-strong)]">{user.email}</p>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <Navigation role={user.role} />
          {isDesktopClient && (
            <DesktopShellHints clientVersion={clientVersion} mode="app" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}
