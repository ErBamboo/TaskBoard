import Link from "next/link";

type MissionEmptyStateProperties = {
  action?: {
    href: string;
    label: string;
  };
  description: string;
  eyebrow: string;
  title: string;
};

export function MissionEmptyState({
  action,
  description,
  eyebrow,
  title,
}: MissionEmptyStateProperties) {
  return (
    <section className="grid gap-5 rounded-[1.8rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(204,75,27,0.14),_transparent_26%),linear-gradient(180deg,_rgba(249,246,239,0.94),_rgba(241,236,226,0.9))] p-6 shadow-[8px_8px_0_var(--color-shadow)]">
      <div className="space-y-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.08em] text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-8 text-[var(--color-muted-strong)]">
          {description}
        </p>
      </div>

      {action ? (
        <div>
          <Link
            href={action.href}
            className="inline-flex rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {action.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
