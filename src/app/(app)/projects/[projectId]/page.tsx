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
      <ProjectOverview board={board} />

      <section className="grid gap-8 2xl:grid-cols-[0.82fr_1.18fr]">
        <TaskEditorForm editor={editor} projectId={projectId} />

        <div className="grid gap-8">
          <ProjectFilters
            projectId={projectId}
            filters={board.filters}
            assignees={board.assignees}
            subsystems={board.subsystems}
            statuses={projectStatusOptions}
            priorities={projectPriorityOptions}
          />
          {board.totalTaskCount > 0 ? (
            <ProjectTaskBoard
              groupedTasks={board.groupedTasks}
              projectId={projectId}
            />
          ) : (
            <MissionEmptyState
              eyebrow="Execution not started"
              title="该项目暂时没有执行任务"
              description="先在左侧录入第一条任务，或由管理员先补齐子系统、负责人和里程碑，再开始拆分执行项。"
            />
          )}
        </div>
      </section>
    </main>
  );
}
