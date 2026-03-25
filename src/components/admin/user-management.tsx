"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createMemberAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
} from "@/features/admin/actions";
import { AdminActionFeedback, AdminSectionShell, AdminSubmitButton } from "@/components/admin/admin-primitives";
import { initialAdminActionState } from "@/features/admin/admin-form-schema";
import type { UserRole } from "@/types/database";

type ManagedUser = {
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
};

type UserManagementProperties = {
  users: ManagedUser[];
};

function UserAccountToggle({
  isActive,
  role,
  userId,
}: {
  isActive: boolean;
  role: UserRole;
  userId: string;
}) {
  const [actionState, formAction] = useActionState(
    toggleUserActiveAction,
    initialAdminActionState,
  );

  if (role === "admin") {
    return (
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        管理员账号
      </span>
    );
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="hidden"
        name="nextIsActive"
        value={isActive ? "false" : "true"}
      />
      <AdminSubmitButton
        idleLabel={isActive ? "停用账号" : "重新启用"}
        pendingLabel="处理中"
      />
      <AdminActionFeedback
        message={actionState.message}
        status={actionState.status}
      />
    </form>
  );
}

function UserPasswordReset({ userId }: { userId: string }) {
  const [actionState, formAction] = useActionState(
    resetUserPasswordAction,
    initialAdminActionState,
  );

  return (
    <details className="group rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.52)] p-3">
      <summary className="cursor-pointer list-none font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
        重置密码
      </summary>

      <form action={formAction} className="mt-3 grid gap-3">
        <input type="hidden" name="userId" value={userId} />
        <label className="grid gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            新密码
          </span>
          <input
            type="password"
            name="newPassword"
            minLength={8}
            required
            className="rounded-[0.9rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="至少 8 位"
          />
        </label>

        <AdminSubmitButton idleLabel="提交新密码" pendingLabel="重置中" />
        <AdminActionFeedback
          message={actionState.message}
          status={actionState.status}
        />
      </form>
    </details>
  );
}

function UserCard({ user }: { user: ManagedUser }) {
  return (
    <article className="grid gap-4 rounded-[1.3rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {user.displayName}
            </h3>
            <span
              className={[
                "rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em]",
                user.role === "admin"
                  ? "border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] text-[#106875]"
                  : "border-[var(--color-line)] text-[var(--color-muted-strong)]",
              ].join(" ")}
            >
              {user.role}
            </span>
            <span
              className={[
                "rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em]",
                user.isActive
                  ? "border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] text-[#106875]"
                  : "border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] text-[var(--color-accent)]",
              ].join(" ")}
            >
              {user.isActive ? "active" : "disabled"}
            </span>
          </div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {user.email}
          </p>
        </div>

        <UserAccountToggle
          isActive={user.isActive}
          role={user.role}
          userId={user.id}
        />
      </div>

      <UserPasswordReset userId={user.id} />
    </article>
  );
}

export function UserManagement({ users }: UserManagementProperties) {
  const [actionState, formAction] = useActionState(
    createMemberAction,
    initialAdminActionState,
  );
  const formReference = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionState.status === "success") {
      formReference.current?.reset();
    }
  }, [actionState.status]);

  return (
    <AdminSectionShell
      eyebrow="Members"
      title="用户管理"
      description="管理员在这里创建成员账号、重置密码，并停用不再参与当前赛季的成员。首版不开放多管理员。"
    >
      <form
        ref={formReference}
        action={formAction}
        className="grid gap-4 rounded-[1.35rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] p-4 lg:grid-cols-[1fr_1fr_0.9fr_auto]"
      >
        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            成员姓名
          </span>
          <input
            type="text"
            name="displayName"
            required
            className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[#106875]"
            placeholder="例如：Mechanical Lead"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            登录邮箱
          </span>
          <input
            type="email"
            name="email"
            required
            className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[#106875]"
            placeholder="member@robot.lab"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            初始密码
          </span>
          <input
            type="password"
            name="initialPassword"
            minLength={8}
            required
            className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[#106875]"
            placeholder="至少 8 位"
          />
        </label>

        <div className="grid content-end gap-2">
          <AdminSubmitButton idleLabel="创建成员" pendingLabel="创建中" />
        </div>

        <div className="lg:col-span-4">
          <AdminActionFeedback
            message={actionState.message}
            status={actionState.status}
          />
        </div>
      </form>

      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </AdminSectionShell>
  );
}
