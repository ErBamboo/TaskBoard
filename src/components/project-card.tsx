import Link from "next/link";

import type { ProjectCardSummary } from "@/features/projects/get-project-list";

type ProjectCardProperties = {
  project: ProjectCardSummary;
};

const projectStatusLabelMap = {
  planning: "规划中",
  active: "进行中",
  archived: "已归档",
} as const;

export function ProjectCard({ project }: ProjectCardProperties) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative overflow-hidden rounded-[1.9rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.92)] p-6 shadow-[10px_10px_0_var(--color-shadow)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="absolute right-5 top-5 h-20 w-20 rounded-full border border-dashed border-[var(--color-line)] transition-transform duration-500 group-hover:rotate-12" />
      <div className="relative grid gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-[var(--color-accent)]">
              Project docket
            </p>
            <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.08em] text-[var(--color-ink)]">
              {project.name}
            </h2>
          </div>
          <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-muted-strong)]">
            {projectStatusLabelMap[project.status]}
          </span>
        </div>

        <p className="max-w-xl text-sm leading-7 text-[var(--color-muted-strong)]">
          {project.description || "暂无项目描述。"}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
              Open Tasks
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
              {project.openTaskCount}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
              Blocked
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-accent)]">
              {project.blockedTaskCount}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
              Milestones
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
              {project.milestoneCount}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
              Integration
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#106875]">
              {project.integrationTaskCount}
            </p>
          </article>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Target{" "}
            {project.targetDate
              ? new Date(project.targetDate).toLocaleDateString("zh-CN")
              : "未设置"}
          </p>
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Open board →
          </span>
        </div>
      </div>
    </Link>
  );
}
