"use client";

type AppErrorProperties = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProperties) {
  return (
    <main className="grid min-h-[60vh] place-items-center">
      <section className="grid max-w-2xl gap-5 rounded-[2rem] border border-[rgba(204,75,27,0.24)] bg-[radial-gradient(circle_at_top_left,_rgba(204,75,27,0.12),_transparent_24%),linear-gradient(180deg,_rgba(249,246,239,0.96),_rgba(241,236,226,0.94))] p-8 shadow-[8px_8px_0_var(--color-shadow)]">
        <div className="space-y-3">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Fault detected
          </p>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)]">
            控制台暂时失联
          </h1>
          <p className="text-base leading-8 text-[var(--color-muted-strong)]">
            当前页数据加载失败。你可以重新载入，或回到导航继续处理其他任务。
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-[rgba(204,75,27,0.24)] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm leading-7 text-[var(--color-accent)]">
          {error.message || "未知错误"}
        </div>

        {error.digest ? (
          <div className="rounded-[1.2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm leading-7 text-[var(--color-muted-strong)]">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Error digest
            </p>
            <p className="mt-2 font-mono text-sm text-[var(--color-ink)]">
              {error.digest}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            检查网络、环境变量或数据库连接后再重试。
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            重新载入
          </button>
        </div>
      </section>
    </main>
  );
}
