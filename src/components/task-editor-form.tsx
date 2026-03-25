"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialTaskActionState,
  upsertTaskAction,
} from "@/features/tasks/actions";
import type { ProjectTaskEditorResponse } from "@/features/tasks/get-project-task-editor";
import {
  taskPriorityOptions,
  taskRelationTypeOptions,
  taskStatusOptions,
} from "@/features/tasks/task-form-schema";
import type { TaskRelationType, TaskStatus } from "@/types/database";

type TaskEditorFormProperties = {
  editor: ProjectTaskEditorResponse;
  projectId: string;
};

type TaskEditorFormBodyProperties = TaskEditorFormProperties;

function SubmitButton({ mode }: { mode: ProjectTaskEditorResponse["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-[1.1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "提交中" : mode === "edit" ? "更新任务" : "创建任务"}
    </button>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor: string;
}) {
  return (
    <label className="grid gap-2" htmlFor={htmlFor}>
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {children}
      </span>
    </label>
  );
}

function TaskEditorFormBody({
  editor,
  projectId,
}: TaskEditorFormBodyProperties) {
  const [taskActionState, taskFormAction] = useActionState(
    upsertTaskAction,
    initialTaskActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    editor.defaults.status,
  );
  const [blockedReasonValue, setBlockedReasonValue] = useState(
    editor.defaults.blockedReason,
  );
  const [selectedRelatedTaskId, setSelectedRelatedTaskId] = useState(
    editor.mode === "create" ? editor.defaults.relatedTaskId : "",
  );
  const [selectedRelationType, setSelectedRelationType] = useState<
    TaskRelationType | ""
  >(editor.mode === "create" ? editor.defaults.relationType : "");

  return (
    <section className="grid gap-5 rounded-[1.9rem] border border-[var(--color-line-strong)] bg-[linear-gradient(180deg,_rgba(249,246,239,0.98),_rgba(242,237,226,0.96))] p-5 shadow-[8px_8px_0_var(--color-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-accent)]">
            Task editor
          </p>
          <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.08em] text-[var(--color-ink)]">
            {editor.mode === "edit" ? "编辑任务" : "新建任务"}
          </h2>
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            {editor.mode === "edit"
              ? "只对当前任务做精确更新，状态卡片上的快速流转仍然保留。"
              : "在当前项目下录入一条明确责任人、子系统和截止时间的执行任务。"}
          </p>
        </div>

        {editor.mode === "edit" ? (
          <Link
            href={`/projects/${projectId}`}
            className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            取消编辑
          </Link>
        ) : null}
      </div>

      <form
        action={taskFormAction}
        className="grid gap-4"
      >
        <input type="hidden" name="taskId" value={editor.defaults.taskId} />
        <input type="hidden" name="projectId" value={editor.defaults.projectId} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor="task-title">任务标题</FieldLabel>
            <input
              id="task-title"
              type="text"
              name="title"
              required
              defaultValue={editor.defaults.title}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="例如：完成视觉串口协议接入"
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="task-group-tag">技术组标签</FieldLabel>
            <input
              id="task-group-tag"
              type="text"
              name="groupTag"
              required
              defaultValue={editor.defaults.groupTag}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="机械 / 电控 / 算法 / 嵌入式 / 软开"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <FieldLabel htmlFor="task-description">任务说明</FieldLabel>
          <textarea
            id="task-description"
            name="description"
            rows={4}
            defaultValue={editor.defaults.description}
            className="min-h-32 rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="写清产出物、交接对象和验收口径。"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <FieldLabel htmlFor="task-subsystem">子系统</FieldLabel>
            <select
              id="task-subsystem"
              name="subsystemId"
              required
              defaultValue={editor.defaults.subsystemId}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              <option value="">选择子系统</option>
              {editor.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="task-assignee">负责人</FieldLabel>
            <select
              id="task-assignee"
              name="assigneeId"
              required
              defaultValue={editor.defaults.assigneeId}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              <option value="">选择负责人</option>
              {editor.assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="task-milestone">里程碑</FieldLabel>
            <select
              id="task-milestone"
              name="milestoneId"
              defaultValue={editor.defaults.milestoneId}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              <option value="">不关联里程碑</option>
              {editor.milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="task-due-at">截止时间</FieldLabel>
            <input
              id="task-due-at"
              type="datetime-local"
              name="dueAt"
              defaultValue={editor.defaults.dueAt}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <FieldLabel htmlFor="task-status">状态</FieldLabel>
            <select
              id="task-status"
              name="status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.currentTarget.value as TaskStatus)
              }
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              {taskStatusOptions.map((taskStatusOption) => (
                <option key={taskStatusOption.value} value={taskStatusOption.value}>
                  {taskStatusOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="task-priority">优先级</FieldLabel>
            <select
              id="task-priority"
              name="priority"
              defaultValue={editor.defaults.priority}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              {taskPriorityOptions.map((taskPriorityOption) => (
                <option
                  key={taskPriorityOption.value}
                  value={taskPriorityOption.value}
                >
                  {taskPriorityOption.label}
                </option>
              ))}
            </select>
          </div>

          <label className="grid gap-2 rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.62)] px-4 py-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              联调任务
            </span>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isIntegrationTask"
                defaultChecked={editor.defaults.isIntegrationTask}
                className="h-4 w-4 rounded border-[var(--color-line)] accent-[var(--color-accent)]"
              />
              <span className="text-sm leading-6 text-[var(--color-muted-strong)]">
                该任务用于跨组联调或集成检查
              </span>
            </div>
          </label>

          <div className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.62)] px-4 py-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              当前模式
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted-strong)]">
              {editor.mode === "edit"
                ? "编辑已有任务"
                : "录入一条新任务"}
            </p>
          </div>
        </div>

        {selectedStatus === "blocked" ? (
          <div className="grid gap-2">
            <FieldLabel htmlFor="task-blocked-reason">阻塞原因</FieldLabel>
            <textarea
              id="task-blocked-reason"
              name="blockedReason"
              rows={3}
              value={blockedReasonValue}
              onChange={(event) => setBlockedReasonValue(event.currentTarget.value)}
              className="min-h-24 rounded-[1rem] border border-[rgba(204,75,27,0.24)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="写清卡点、依赖方和下一步。"
            />
          </div>
        ) : (
          <input type="hidden" name="blockedReason" value="" />
        )}

        {editor.mode === "create" ? (
          <div className="grid gap-4 rounded-[1.2rem] border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] p-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="task-related-task">关联任务</FieldLabel>
              <select
                id="task-related-task"
                name="relatedTaskId"
                value={selectedRelatedTaskId}
                onChange={(event) => {
                  const nextRelatedTaskId = event.currentTarget.value;
                  setSelectedRelatedTaskId(nextRelatedTaskId);

                  if (!nextRelatedTaskId) {
                    setSelectedRelationType("");
                  }
                }}
                className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[#106875]"
              >
                <option value="">不设置关联任务</option>
                {editor.relatedTasks.map((relatedTask) => (
                  <option key={relatedTask.id} value={relatedTask.id}>
                    {relatedTask.subsystemName} / {relatedTask.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="task-relation-type">关系类型</FieldLabel>
              <select
                id="task-relation-type"
                name="relationType"
                value={selectedRelationType}
                onChange={(event) =>
                  setSelectedRelationType(
                    event.currentTarget.value as TaskRelationType | "",
                  )
                }
                disabled={!selectedRelatedTaskId}
                className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[#106875] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">选择关系类型</option>
                {taskRelationTypeOptions.map((relationTypeOption) => (
                  <option
                    key={relationTypeOption.value}
                    value={relationTypeOption.value}
                  >
                    {relationTypeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="md:col-span-2 text-sm leading-7 text-[#106875]">
              新建任务时可顺手建立一条主关联关系。多条联调依赖的精细维护放到后续管理页再做。
            </p>
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-[var(--color-line)] px-4 py-3 text-sm leading-7 text-[var(--color-muted-strong)]">
            编辑模式当前只更新任务本体字段，关联任务关系保留原样。
          </div>
        )}

        {taskActionState.status !== "idle" ? (
          <p
            className={[
              "rounded-[1rem] px-4 py-3 text-sm leading-7",
              taskActionState.status === "error"
                ? "border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] text-[var(--color-accent)]"
                : "border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] text-[#106875]",
            ].join(" ")}
          >
            {taskActionState.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            每条任务只设一个主负责人，跨组协作通过关联任务和联调任务拆开处理。
          </p>
          <SubmitButton mode={editor.mode} />
        </div>
      </form>
    </section>
  );
}

export function TaskEditorForm({
  editor,
  projectId,
}: TaskEditorFormProperties) {
  const formInstanceKey = [
    editor.mode,
    editor.defaults.taskId || "new",
    editor.defaults.status,
    editor.defaults.relatedTaskId || "none",
  ].join(":");

  return (
    <TaskEditorFormBody
      key={formInstanceKey}
      editor={editor}
      projectId={projectId}
    />
  );
}
