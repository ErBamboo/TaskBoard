import { redirect } from "next/navigation";

import { MilestoneManagement } from "@/components/admin/milestone-management";
import { ProjectManagement } from "@/components/admin/project-management";
import { SubsystemManagement } from "@/components/admin/subsystem-management";
import { UserManagement } from "@/components/admin/user-management";
import { getAdminConsole } from "@/features/admin/get-admin-console";
import { getSessionUser } from "@/lib/auth/get-session-user";

type AdminPageProperties = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProperties) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/my-tasks");
  }

  const adminConsole = await getAdminConsole((await searchParams) ?? {});

  if (adminConsole.projects.length === 0) {
    redirect("/setup");
  }

  return (
    <main className="grid gap-8">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(16,104,117,0.12),_transparent_28%),linear-gradient(180deg,_rgba(249,246,239,0.96),_rgba(241,236,226,0.94))] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Admin control room
          </p>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-5xl">
            管理控制台
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--color-muted-strong)]">
            这里维护团队成员、项目主结构、子系统和里程碑。普通成员不接触这层结构，避免项目边界和阶段目标被日常执行噪音冲散。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Active Members
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
              {adminConsole.summary.activeMemberCount}
            </p>
          </article>
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Active Projects
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
              {adminConsole.summary.activeProjectCount}
            </p>
          </article>
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Subsystems
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
              {adminConsole.summary.subsystemCount}
            </p>
          </article>
          <article className="rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Milestones
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
              {adminConsole.summary.milestoneCount}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-8 2xl:grid-cols-[0.92fr_1.08fr]">
        <UserManagement users={adminConsole.users} />
        <ProjectManagement
          editor={adminConsole.projectEditor}
          projects={adminConsole.projects}
          scopeProjectId={adminConsole.scopeProjectId}
        />
      </section>

      <section className="grid gap-8 2xl:grid-cols-2">
        <SubsystemManagement
          editor={adminConsole.subsystemEditor}
          projects={adminConsole.projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          scopeProjectId={adminConsole.scopeProjectId}
          scopeProjectName={adminConsole.scopeProjectName}
          subsystems={adminConsole.subsystems}
        />
        <MilestoneManagement
          editor={adminConsole.milestoneEditor}
          milestones={adminConsole.milestones}
          projects={adminConsole.projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          scopeProjectId={adminConsole.scopeProjectId}
          scopeProjectName={adminConsole.scopeProjectName}
        />
      </section>
    </main>
  );
}
