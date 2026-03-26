"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  upsertTaskAction,
} from "@/features/tasks/actions";
import type { ProjectTaskEditorResponse } from "@/features/tasks/get-project-task-editor";
import {
  initialTaskActionState,
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
    <form action={taskFormAction} className="grid gap-6">
      <input type="hidden" name="taskId" value={editor.defaults.taskId} />
      <input type="hidden" name="projectId" value={editor.defaults.projectId} />

      <div className="space-y-6">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              任务标题
            </span>
            <input
              type="text"
              name="title"
              required
              defaultValue={editor.defaults.title}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
              placeholder="例如：完成视觉串口协议接入"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              技术组标签
            </span>
            <input
              type="text"
              name="groupTag"
              required
              defaultValue={editor.defaults.groupTag}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
              placeholder="机械 / 电控 / 算法 / 嵌入式 / 软开"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            任务说明
          </span>
          <textarea
            name="description"
            rows={5}
            defaultValue={editor.defaults.description}
            className="w-full min-h-32 rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base leading-8 text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            placeholder="写清产出物、交接对象和验收口径。"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              子系统
            </span>
            <select
              name="subsystemId"
              required
              defaultValue={editor.defaults.subsystemId}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            >
              <option value="">选择子系统</option>
              {editor.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              负责人
            </span>
            <select
              name="assigneeId"
              required
              defaultValue={editor.defaults.assigneeId}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            >
              <option value="">选择负责人</option>
              {editor.assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              里程碑
            </span>
            <select
              name="milestoneId"
              defaultValue={editor.defaults.milestoneId}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            >
              <option value="">不关联里程碑</option>
              {editor.milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              截止时间
            </span>
            <input
              type="datetime-local"
              name="dueAt"
              defaultValue={editor.defaults.dueAt}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              状态
            </span>
            <select
              name="status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.currentTarget.value as TaskStatus)
              }
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
            >
              {taskStatusOptions.map((taskStatusOption) => (
                <option key={taskStatusOption.value} value={taskStatusOption.value}>
                  {taskStatusOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              优先级
            </span>
            <select
              name="priority"
              defaultValue={editor.defaults.priority}
              className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-5 py-3.5 text-base text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
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
          </label>
        </div>

        <label className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.4)] p-4">
          <input
            type="checkbox"
            name="isIntegrationTask"
            defaultChecked={editor.defaults.isIntegrationTask}
            className="h-5 w-5 rounded-md border-[var(--color-line)] accent-[var(--color-accent)]"
          />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              联调任务
            </p>
            <p className="text-xs text-[var(--color-muted-strong)]">
              该任务用于跨组联调或集成检查
            </p>
          </div>
        </label>

        {selectedStatus === "blocked" ? (
          <label className="grid gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-accent)]">
              阻塞原因
            </span>
            <textarea
              name="blockedReason"
              rows={3}
              value={blockedReasonValue}
              onChange={(event) => setBlockedReasonValue(event.currentTarget.value)}
              className="w-full min-h-24 rounded-[1.25rem] border border-[rgba(204,75,27,0.3)] bg-[rgba(204,75,27,0.04)] px-5 py-3.5 text-base leading-8 text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(204,75,27,0.08)]"
              placeholder="写清卡点、依赖方和下一步。"
            />
          </label>
        ) : (
          <input type="hidden" name="blockedReason" value="" />
        )}

        {editor.mode === "create" ? (
          <div className="grid gap-5 rounded-[1.5rem] border border-[rgba(16,104,117,0.15)] bg-[rgba(16,104,117,0.04)] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#106875]">
                  关联任务
                </span>
                <select
                  name="relatedTaskId"
                  value={selectedRelatedTaskId}
                  onChange={(event) => {
                    const nextRelatedTaskId = event.currentTarget.value;
                    setSelectedRelatedTaskId(nextRelatedTaskId);
                    if (!nextRelatedTaskId) setSelectedRelationType("");
                  }}
                  className="w-full rounded-[1rem] border border-[rgba(16,104,117,0.2)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none focus:border-[#106875]"
                >
                  <option value="">不设置关联</option>
                  {editor.relatedTasks.map((relatedTask) => (
                    <option key={relatedTask.id} value={relatedTask.id}>
                      {relatedTask.subsystemName} / {relatedTask.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#106875]">
                  关系类型
                </span>
                <select
                  name="relationType"
                  value={selectedRelationType}
                  onChange={(event) =>
                    setSelectedRelationType(
                      event.currentTarget.value as TaskRelationType | "",
                    )
                  }
                  disabled={!selectedRelatedTaskId}
                  className="w-full rounded-[1rem] border border-[rgba(16,104,117,0.2)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none focus:border-[#106875] disabled:opacity-50"
                >
                  <option value="">选择关系</option>
                  {taskRelationTypeOptions.map((relationTypeOption) => (
                    <option key={relationTypeOption.value} value={relationTypeOption.value}>
                      {relationTypeOption.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {taskActionState.status !== "idle" ? (
          <div
            className={[
              "rounded-[1.25rem] px-5 py-4 text-sm leading-8 transition-all animate-in zoom-in-95",
              taskActionState.status === "error"
                ? "border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] text-[var(--color-accent)]"
                : "border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] text-[#106875]",
            ].join(" ")}
          >
            {taskActionState.message}
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-[var(--color-line)] bg-[rgba(249,246,239,0.9)] p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-muted-strong)] opacity-80 max-w-[240px]">
            请确保任务拆分粒度在 1-3 个工作日内。
          </p>
          <SubmitButton mode={editor.mode} />
        </div>
      </div>
    </form>
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
