import type { ProjectBoardFilters } from "@/features/projects/get-project-board";

type ProjectFiltersProperties = {
  assignees: Array<{
    id: string;
    name: string;
  }>;
  filters: ProjectBoardFilters;
  priorities: string[];
  projectId: string;
  statuses: Array<{
    label: string;
    value: string;
  }>;
  subsystems: Array<{
    id: string;
    name: string;
  }>;
};

function FilterSelect({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string;
  label: string;
  name: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-[1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
      >
        {options.map((option) => (
          <option key={option.value || `${name}-all`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProjectFilters({
  assignees,
  filters,
  priorities,
  projectId,
  statuses,
  subsystems,
}: ProjectFiltersProperties) {
  return (
    <section className="rounded-[1.8rem] border border-[var(--color-line-strong)] bg-[var(--color-panel)] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
            项目筛选
          </h2>
        </div>
        <a
          href={`/projects/${projectId}`}
          className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[var(--color-accent)]"
        >
          Reset filters
        </a>
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          name="subsystemId"
          label="子系统"
          defaultValue={filters.subsystemId}
          options={[
            { label: "全部子系统", value: "" },
            ...subsystems.map((subsystem) => ({
              label: subsystem.name,
              value: subsystem.id,
            })),
          ]}
        />
        <FilterSelect
          name="assigneeId"
          label="负责人"
          defaultValue={filters.assigneeId}
          options={[
            { label: "全部负责人", value: "" },
            ...assignees.map((assignee) => ({
              label: assignee.name,
              value: assignee.id,
            })),
          ]}
        />
        <FilterSelect
          name="status"
          label="状态"
          defaultValue={filters.status}
          options={[{ label: "全部状态", value: "" }, ...statuses]}
        />
        <FilterSelect
          name="priority"
          label="优先级"
          defaultValue={filters.priority}
          options={[
            { label: "全部优先级", value: "" },
            ...priorities.map((priority) => ({
              label: priority,
              value: priority,
            })),
          ]}
        />

        <div className="md:col-span-2 xl:col-span-4">
          <button
            type="submit"
            className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            Apply filters
          </button>
        </div>
      </form>
    </section>
  );
}
