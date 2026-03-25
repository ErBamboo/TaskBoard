import Link from "next/link";
import { redirect } from "next/navigation";

import { SetupWizard } from "@/components/setup/setup-wizard";
import { resolveSetupPageMode } from "@/features/setup/setup-routing";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getSetupState } from "@/features/setup/get-setup-state";

export default async function SetupPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/my-tasks");
  }

  const setupState = await getSetupState();

  const setupPageMode = resolveSetupPageMode({
    role: sessionUser.role,
    isInitialized: setupState.isInitialized,
  });

  if (setupPageMode === "completed") {
    return (
      <main className="grid gap-8">
        <section className="grid gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(16,104,117,0.12),_transparent_28%),linear-gradient(180deg,_rgba(249,246,239,0.96),_rgba(241,236,226,0.94))] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[#106875]">
              Workspace ready
            </p>
            <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-5xl">
              工作区已初始化
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--color-muted-strong)]">
              初始化已经完成。后续如需调整项目、子系统或里程碑，请进入管理台维护；普通成员安装客户端并登录后即可直接使用。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.35rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Team
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                {setupState.teamSettings?.teamName ?? "未设置"}
              </p>
            </article>
            <article className="rounded-[1.35rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Season
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                {setupState.teamSettings?.seasonName ?? "未设置"}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 rounded-[1.5rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Next actions
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)]"
            >
              进入管理台
            </Link>
            <Link
              href="/my-tasks"
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-muted-strong)]"
            >
              进入我的任务
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grid gap-8">
      <section className="grid gap-5 rounded-[2rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(16,104,117,0.12),_transparent_28%),linear-gradient(180deg,_rgba(249,246,239,0.96),_rgba(241,236,226,0.94))] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
            First deployment
          </p>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-5xl">
            首次启动向导
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--color-muted-strong)]">
            这一步会一次性建立战队基础信息、初始项目、默认子系统模板和成员账号。完成后，普通成员安装客户端并登录即可直接开始使用。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Project template
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted-strong)]">
              创建 1-3 个初始项目，并自动生成默认子系统模板。
            </p>
          </article>
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Member bootstrap
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted-strong)]">
              导入首批成员，系统会自动生成临时密码并在完成页回显。
            </p>
          </article>
        </div>
      </section>

      <SetupWizard
        defaults={{
          teamName: setupState.teamSettings?.teamName ?? "",
          seasonName: setupState.teamSettings?.seasonName ?? "",
        }}
      />
    </main>
  );
}
