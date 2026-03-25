import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { DesktopShellHints } from "@/components/desktop/desktop-shell-hints";
import { LoginForm } from "@/features/auth/login-form";
import { getSetupState } from "@/features/setup/get-setup-state";
import { shouldRedirectAdminToSetup } from "@/features/setup/setup-routing";
import { getSessionUser } from "@/lib/auth/get-session-user";
import {
  getDesktopClientVersionFromUserAgent,
  isDesktopClientUserAgent,
} from "@/lib/desktop/is-desktop-client";
import { sanitizeRedirectPath } from "@/lib/auth/route-guards";

type LoginPageProperties = {
  searchParams?: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProperties) {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    if (sessionUser.role === "admin") {
      const setupState = await getSetupState();

      if (
        shouldRedirectAdminToSetup({
          role: sessionUser.role,
          isInitialized: setupState.isInitialized,
        })
      ) {
        redirect("/setup");
      }
    }

    redirect("/my-tasks");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectTo = sanitizeRedirectPath(resolvedSearchParams?.redirectTo);
  const headersStore = await headers();
  const userAgent = headersStore.get("user-agent");
  const isDesktopClient = isDesktopClientUserAgent(
    userAgent,
  );
  const clientVersion = getDesktopClientVersionFromUserAgent(userAgent);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl flex-col gap-8 px-6 py-10 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-10 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.92)] p-8 shadow-[10px_10px_0_var(--color-shadow)] lg:p-10">
        <div className="grid gap-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-[var(--color-muted)]">
              {isDesktopClient ? "Windows desktop access" : "Internal-only access"}
            </span>
          </div>

          <div className="space-y-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.38em] text-[var(--color-accent)]">
              Competition operations login
            </p>
            <h1 className="max-w-2xl font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-5xl uppercase leading-[0.9] tracking-[0.09em] text-[var(--color-ink)] lg:text-6xl">
              {isDesktopClient ? "进入战队桌面终端" : "进入团队项目控制台"}
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--color-muted-strong)]">
              {isDesktopClient
                ? "当前正在通过 Windows 客户端访问。首次登录后系统会记住你的状态，下次打开软件可直接进入任务面板。"
                : "这个系统只服务于内部成员。登录后优先看到自己的任务推进、阻塞状态和项目联调收口，不做外部访客入口。"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Structure
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-strong)]">
                项目 → 子系统 → 里程碑 → 任务
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Responsibility
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-strong)]">
                每条任务只有一个主负责人
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Collaboration
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-strong)]">
                跨组协作拆成关联任务加联调任务
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-[var(--color-line-strong)] bg-[rgba(238,232,221,0.92)] p-8 shadow-[10px_10px_0_var(--color-shadow)] lg:p-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Access checkpoint
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[0.05em] text-[var(--color-ink)]">
              成员登录
            </h2>
          </div>
          <div className="rounded-full border border-[var(--color-line)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Auth
          </div>
        </div>

        <LoginForm redirectTo={redirectTo} />

        {isDesktopClient ? (
          <DesktopShellHints clientVersion={clientVersion} mode="login" />
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-[var(--color-line-strong)] px-4 py-4 text-sm leading-7 text-[var(--color-muted-strong)]">
            管理员负责创建成员账号和初始化密码。普通成员只能在已有项目与子系统下创建和推进任务。
          </div>
        )}
      </section>
    </main>
  );
}
