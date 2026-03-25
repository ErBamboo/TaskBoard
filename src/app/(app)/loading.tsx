export default function AppLoading() {
  return (
    <main className="grid min-h-[60vh] place-items-center">
      <section className="grid max-w-2xl gap-5 rounded-[2rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(16,104,117,0.12),_transparent_24%),linear-gradient(180deg,_rgba(249,246,239,0.96),_rgba(241,236,226,0.94))] p-8 text-center shadow-[8px_8px_0_var(--color-shadow)]">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[rgba(16,104,117,0.16)] border-t-[var(--color-accent)]" />
        <div className="space-y-3">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Syncing workspace
          </p>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)]">
            控制台载入中
          </h1>
          <p className="text-base leading-8 text-[var(--color-muted-strong)]">
            正在同步任务、项目和管理员配置。
          </p>
        </div>
      </section>
    </main>
  );
}
