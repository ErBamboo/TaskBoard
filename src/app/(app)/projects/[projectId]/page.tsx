import {
  getProjectBoard,
  normalizeProjectBoardFilters,
} from "@/features/projects/get-project-board";
import { MissionEmptyState } from "@/components/mission-empty-state";
import { ProjectFilters } from "@/components/project-filters";
import { ProjectOverview } from "@/components/project-overview";
import { ProjectTaskBoard } from "@/components/project-task-board";
import { TaskEditorForm } from "@/components/task-editor-form";
import { getProjectTaskEditor } from "@/features/tasks/get-project-task-editor";
import { TaskEditorController } from "@/components/task-editor-controller";
import Link from "next/link";

type ProjectBoardPageProperties = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const projectStatusOptions = [
  { label: "待开始", value: "todo" },
  { label: "进行中", value: "in_progress" },
  { label: "阻塞", value: "blocked" },
  { label: "已完成", value: "done" },
];

const projectPriorityOptions = ["low", "medium", "high", "urgent"];

function sanitizeSearchParamValue(
  searchParamValue: string | string[] | undefined,
) {
  return typeof searchParamValue === "string" ? searchParamValue : null;
}

export default async function ProjectBoardPage({
  params,
  searchParams,
}: ProjectBoardPageProperties) {
  const { projectId } = await params;
  const resolvedSearchParams: Record<string, string | string[] | undefined> =
    (await searchParams) ?? {};
  const filters = await normalizeProjectBoardFilters(resolvedSearchParams);
  const editTaskId = sanitizeSearchParamValue(resolvedSearchParams.editTaskId);

  const [board, editor] = await Promise.all([
    getProjectBoard(projectId, filters),
    getProjectTaskEditor(projectId, editTaskId),
  ]);

  return (
    <main className="grid gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <ProjectOverview board={board} />
        <Link
          href={`/projects/${projectId}?new=true`}
          className="flex h-fit items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] shadow-[0_8px_16px_-4px_rgba(17,21,22,0.24)] transition-transform hover:-translate-y-0.5"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          录入新任务
        </Link>
      </div>

      <ProjectFilters
        projectId={projectId}
        filters={board.filters}
        assignees={board.assignees}
        subsystems={board.subsystems}
        statuses={projectStatusOptions}
        priorities={projectPriorityOptions}
      />

      <section>
        {board.totalTaskCount > 0 ? (
          <ProjectTaskBoard
            groupedTasks={board.groupedTasks}
            projectId={projectId}
          />
        ) : (
          <MissionEmptyState
            eyebrow="Execution not started"
            title="该项目暂时没有执行任务"
            description="点击上方“录入新任务”开始拆分执行项，或由管理员先补齐子系统、负责人和里程碑。"
          />
        )}
      </section>

      <TaskEditorController>
        <TaskEditorForm editor={editor} />
      </TaskEditorController>
    </main>
  );
}
