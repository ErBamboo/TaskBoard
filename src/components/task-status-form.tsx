"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialTaskActionState,
  updateTaskStatusAction,
} from "@/features/tasks/actions";
import { taskStatusOptions } from "@/features/tasks/task-form-schema";
import type { TaskStatus } from "@/types/database";

type TaskStatusFormProperties = {
  blockedReason: string;
  currentStatus: TaskStatus;
  taskId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "提交中" : "更新状态"}
    </button>
  );
}

export function TaskStatusForm({
  blockedReason,
  currentStatus,
  taskId,
}: TaskStatusFormProperties) {
  const [taskActionState, taskStatusAction] = useActionState(
    updateTaskStatusAction,
    initialTaskActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(currentStatus);
  const [blockedReasonValue, setBlockedReasonValue] = useState(blockedReason);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    setBlockedReasonValue(blockedReason);
  }, [blockedReason]);

  return (
    <form action={taskStatusAction} className="grid gap-3 rounded-[1.1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.62)] p-3">
      <input type="hidden" name="taskId" value={taskId} />

      <label className="grid gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          任务状态
        </span>
        <select
          aria-label="任务状态"
          name="status"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.currentTarget.value as TaskStatus)
          }
          className="rounded-[0.95rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
        >
          {taskStatusOptions.map((taskStatusOption) => (
            <option key={taskStatusOption.value} value={taskStatusOption.value}>
              {taskStatusOption.label}
            </option>
          ))}
        </select>
      </label>

      {selectedStatus === "blocked" ? (
        <label className="grid gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            阻塞原因
          </span>
          <textarea
            aria-label="阻塞原因"
            name="blockedReason"
            rows={3}
            value={blockedReasonValue}
            onChange={(event) => setBlockedReasonValue(event.currentTarget.value)}
            className="min-h-24 rounded-[0.95rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-3 text-sm leading-6 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="说明当前卡点、依赖项或等待对象。"
          />
        </label>
      ) : (
        <input type="hidden" name="blockedReason" value="" />
      )}

      {taskActionState.status !== "idle" ? (
        <p
          className={[
            "rounded-[0.95rem] px-3 py-2 text-sm leading-6",
            taskActionState.status === "error"
              ? "border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] text-[var(--color-accent)]"
              : "border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] text-[#106875]",
          ].join(" ")}
        >
          {taskActionState.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
