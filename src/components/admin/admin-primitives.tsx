"use client";

import type { ReactNode } from "react";

import { useFormStatus } from "react-dom";

type AdminActionFeedbackProperties = {
  message: string;
  status: "error" | "idle" | "success";
};

type AdminSectionShellProperties = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function AdminActionFeedback({
  message,
  status,
}: AdminActionFeedbackProperties) {
  if (status === "idle" || !message) {
    return null;
  }

  return (
    <p
      className={[
        "rounded-[1rem] px-4 py-3 text-sm leading-7",
        status === "error"
          ? "border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] text-[var(--color-accent)]"
          : "border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] text-[#106875]",
      ].join(" ")}
    >
      {message}
    </p>
  );
}

export function AdminSectionShell({
  children,
  description,
  eyebrow,
  title,
}: AdminSectionShellProperties) {
  return (
    <section className="flex flex-col gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[linear-gradient(180deg,_rgba(249,246,239,0.98),_rgba(241,236,226,0.96))] p-6 shadow-[0_8px_32px_-12px_var(--color-shadow),_0_0_0_1px_rgba(255,255,255,0.4)_inset]">
      <div className="space-y-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-4xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-8 text-[var(--color-muted-strong)] opacity-90">
          {description}
        </p>
      </div>

      <div className="grid gap-6">
        {children}
      </div>
    </section>
  );
}
