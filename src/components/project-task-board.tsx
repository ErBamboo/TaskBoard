"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import { TaskStatusForm } from "@/components/task-status-form";
import { deleteTaskAction } from "@/features/tasks/actions";
import type {
  ProjectBoardTask,
  ProjectBoardTaskGroups,
} from "@/features/projects/get-project-board";

type ProjectTaskBoardProperties = {
  groupedTasks: ProjectBoardTaskGroups;
  projectId: string;
};

function ProjectTaskCard({
  projectId,
  task,
}: {
  projectId: string;
  task: ProjectBoardTask;
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    if (isStatusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusOpen]);

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTaskAction(projectId, task.id);
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <article
      className={[
        "group relative flex flex-col gap-4 rounded-[1.25rem] border bg-white/70 p-5 transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        task.status === "blocked"
          ? "border-[rgba(204,75,27,0.2)] bg-[rgba(204,75,27,0.02)]"
          : "border-[var(--color-line)]",
        isDeleting ? "opacity-50 grayscale pointer-events-none" : ""
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {task.subsystemName}
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-line-strong)]" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">
              {task.assigneeName}
            </span>
          </div>
          <h3 className="text-[0.92rem] font-semibold leading-relaxed tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
            {task.title}
          </h3>
        </div>
        {task.isIntegrationTask && (
          <div className="flex h-6 items-center rounded-md border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.05)] px-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[#106875]">
            INTG
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] text-[var(--color-muted-strong)]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono opacity-60">PRIO:</span>
          <span className="font-semibold uppercase tracking-wider">{task.priority}</span>
        </div>
        {task.dueAt && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono opacity-60">DUE:</span>
            <span className="font-semibold">
              {new Date(task.dueAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {task.status === "blocked" && task.blockedReason && (
        <div className="rounded-lg border border-[rgba(204,75,27,0.15)] bg-[rgba(204,75,27,0.05)] p-3 text-[0.75rem] leading-6 text-[var(--color-accent)]">
          <span className="mr-1 font-bold">BLOCKED:</span> {task.blockedReason}
        </div>
      )}

      {(task.canEdit || task.canUpdateStatus) && (
        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-line)] pt-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-4">
            {task.canEdit ? (
              <>
                <Link
                  href={`/projects/${projectId}?editTaskId=${task.id}`}
                  className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className={[
                    "font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] transition-colors",
                    isConfirmingDelete ? "text-[var(--color-accent)] animate-pulse" : "text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                  ].join(" ")}
                >
                  {isConfirmingDelete ? "Click to Confirm" : "Delete"}
                </button>
              </>
            ) : (
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                View Only
              </span>
            )}
          </div>

          {task.canUpdateStatus && (
            <div className="relative" ref={statusMenuRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted-strong)] hover:text-[var(--color-ink)]"
              >
                {isStatusOpen ? "Close Menu" : "Move Status"}
              </button>
              
              {isStatusOpen && (
                <div className="absolute bottom-full right-0 z-10 mb-2 w-48 rounded-xl border border-[var(--color-line-strong)] bg-white p-2 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                  <TaskStatusForm
                    blockedReason={task.blockedReason}
                    currentStatus={task.status}
                    taskId={task.id}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function ProjectTaskColumn({
  label,
  projectId,
  tasks,
}: {
  label: string;
  projectId: string;
  tasks: ProjectBoardTask[];
}) {
  return (
    <section className="flex flex-col gap-5 rounded-[2rem] border border-transparent bg-[rgba(31,36,38,0.03)] p-6 transition-colors hover:bg-[rgba(31,36,38,0.05)]">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-xl uppercase tracking-[0.12em] text-[var(--color-ink)]">
            {label}
          </h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-[0.6rem] text-white">
            {tasks.length}
          </span>
        </div>
        <Link
          href={`/projects/${projectId}?new=true`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-all hover:bg-[var(--color-ink)] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <ProjectTaskCard key={task.id} projectId={projectId} task={task} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--color-line-strong)] py-12 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              No tasks active
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const boardColumns = [
  { key: "todo", label: "待开始" },
  { key: "in_progress", label: "进行中" },
  { key: "blocked", label: "阻塞任务" },
  { key: "done", label: "已完成" },
] as const;

export function ProjectTaskBoard({
  groupedTasks,
  projectId,
}: ProjectTaskBoardProperties) {
  return (
    <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
      {boardColumns.map((boardColumn) => (
        <ProjectTaskColumn
          key={boardColumn.key}
          label={boardColumn.label}
          projectId={projectId}
          tasks={groupedTasks[boardColumn.key]}
        />
      ))}
    </section>
  );
}
