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
    <section className="grid gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.92)] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {projectStatusLabelMap[board.project.status]}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted)]">
            Project board
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-5xl">
            {board.project.name}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[var(--color-muted-strong)]">
            {board.project.description || "暂无项目描述。"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.68)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Total Tasks
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
              {board.totalTaskCount}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[rgba(204,75,27,0.18)] bg-[rgba(204,75,27,0.06)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Blocked
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-accent)]">
              {board.blockedTaskCount}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[rgba(16,104,117,0.18)] bg-[rgba(16,104,117,0.08)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Integration
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#106875]">
              {board.integrationTaskCount}
            </p>
          </article>
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.7rem] border border-[var(--color-line-strong)] bg-[var(--color-panel)] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
              Milestones
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              里程碑进度
            </h2>
          </div>
          <span className="font-mono text-lg text-[var(--color-accent)]">
            {completionRatio}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[rgba(31,36,38,0.08)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,_#cc4b1b,_#106875)] transition-all duration-500"
            style={{ width: `${completionRatio}%` }}
          />
        </div>

        <div className="grid gap-3">
          {board.milestones.length > 0 ? (
            board.milestones.map((milestone) => (
              <article
                key={milestone.id}
                className="rounded-[1.2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.64)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold tracking-[0.04em] text-[var(--color-ink)]">
                    {milestone.name}
                  </p>
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
                    {milestoneStatusLabelMap[milestone.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-strong)]">
                  截止：
                  {milestone.dueDate
                    ? new Date(milestone.dueDate).toLocaleDateString("zh-CN")
                    : "未设置"}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
              当前项目还没有里程碑。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
