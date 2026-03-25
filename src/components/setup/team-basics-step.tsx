"use client";

type TeamBasicsStepProperties = {
  seasonName: string;
  setSeasonName: (value: string) => void;
  setTeamName: (value: string) => void;
  teamName: string;
};

export function TeamBasicsStep({
  seasonName,
  setSeasonName,
  setTeamName,
  teamName,
}: TeamBasicsStepProperties) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label
          htmlFor="setup-team-name"
          className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
        >
          战队名称
        </label>
        <input
          id="setup-team-name"
          type="text"
          value={teamName}
          onChange={(event) => setTeamName(event.currentTarget.value)}
          className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
          placeholder="例如：Oh My Robot Lab"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="setup-season-name"
          className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
        >
          当前赛季
        </label>
        <input
          id="setup-season-name"
          type="text"
          value={seasonName}
          onChange={(event) => setSeasonName(event.currentTarget.value)}
          className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
          placeholder="例如：2026 赛季"
        />
      </div>
    </div>
  );
}
