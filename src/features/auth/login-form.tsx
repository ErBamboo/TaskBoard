"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { LoginActionState } from "@/app/(auth)/login/actions";
import { signInAction } from "@/app/(auth)/login/actions";

type LoginFormProperties = {
  redirectTo: string;
};

const initialLoginActionState: LoginActionState = {
  message: "",
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-[1.25rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-sm uppercase tracking-[0.24em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Signing In" : "Enter Console"}
    </button>
  );
}

export function LoginForm({ redirectTo }: LoginFormProperties) {
  const [loginActionState, loginFormAction] = useActionState(
    signInAction,
    initialLoginActionState,
  );

  return (
    <form action={loginFormAction} className="grid gap-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="grid gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-base text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
          placeholder="captain@robot.lab"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Password
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-base text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
          placeholder="••••••••"
        />
      </label>

      {loginActionState.status === "error" ? (
        <p className="rounded-2xl border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] px-4 py-3 text-sm leading-6 text-[var(--color-accent)]">
          {loginActionState.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
