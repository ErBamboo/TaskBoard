import type { ProjectBoardResponse } from "@/features/projects/get-project-board";

type ProjectOverviewProperties = {
  board: ProjectBoardResponse;
};

const milestoneStatusLabelMap = {
  pending: "未开始",
  active: "进行中",
  completed: "已完成",
} as const;

const projectStatusLabelMap = {
  planning: "规划中",
  active: "进行中",
  archived: "已归档",
} as const;

function milestoneCompletionRatio(
  completedMilestoneCount: number,
  totalMilestoneCount: number,
) {
  if (totalMilestoneCount === 0) {
    return 0;
  }

  return Math.round((completedMilestoneCount / totalMilestoneCount) * 100);
}

export function ProjectOverview({ board }: ProjectOverviewProperties) {
  const completedMilestoneCount = board.milestones.filter(
    (milestone) => milestone.status === "completed",
  ).length;
  const completionRatio = milestoneCompletionRatio(
    completedMilestoneCount,
    board.milestones.length,
  );

  return (
    <section className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-3 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white">
              {projectStatusLabelMap[board.project.status]}
            </span>
            <div className="h-px flex-1 bg-[var(--color-line)]" />
          </div>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-5xl font-black uppercase tracking-tight text-[var(--color-ink)] lg:text-6xl">
            {board.project.name}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-muted-strong)] opacity-80">
            {board.project.description || "Project parameters not defined."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-12">
          <div className="space-y-1">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Total Backlog
            </p>
            <p className="text-4xl font-black tracking-tighter text-[var(--color-ink)]">
              {board.totalTaskCount.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Critical Blocks
            </p>
            <p className="text-4xl font-black tracking-tighter text-[var(--color-accent)]">
              {board.blockedTaskCount.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#106875]">
              Active Intg
            </p>
            <p className="text-4xl font-black tracking-tighter text-[#106875]">
              {board.integrationTaskCount.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full xl:max-w-md space-y-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-white/40 p-8 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Phase Progress
            </p>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
              里程碑达成率
            </h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-3xl font-black text-[var(--color-ink)]">
              {completionRatio}%
            </span>
          </div>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="absolute left-0 top-0 h-full bg-[var(--color-ink)] transition-all duration-1000 ease-out"
            style={{ width: `${completionRatio}%` }}
          />
        </div>

        <div className="space-y-3">
          {board.milestones.length > 0 ? (
            board.milestones.slice(0, 3).map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between gap-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className={[
                    "h-2 w-2 rounded-full",
                    milestone.status === "completed" ? "bg-[#106875]" : "bg-[var(--color-line-strong)]"
                  ].join(" ")} />
                  <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">
                    {milestone.name}
                  </p>
                </div>
                <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {milestoneStatusLabelMap[milestone.status]}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)]">
              No milestones defined
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
