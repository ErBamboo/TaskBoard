import { ProjectCard } from "@/components/project-card";
import { getProjectList } from "@/features/projects/get-project-list";

export default async function ProjectsPage() {
  const projectList = await getProjectList();

  return (
    <main className="grid gap-6">
      <section className="rounded-[2rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.92)] p-6 shadow-[8px_8px_0_var(--color-shadow)]">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
          Project operations
        </p>
        <h1 className="mt-4 font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)]">
          项目
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted-strong)]">
          这里按机器人或专项模块组织项目，而不是按技术组拆碎任务。你可以先从项目卡片进入，再在项目看板里按子系统、负责人和状态筛选。
        </p>
      </section>

      {projectList.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : (
        <section className="rounded-[1.7rem] border border-dashed border-[var(--color-line-strong)] px-6 py-8 text-sm leading-8 text-[var(--color-muted-strong)]">
          当前没有项目数据。你可以先执行 Supabase 的迁移和种子数据，再刷新页面查看项目卡片。
        </section>
      )}
    </main>
  );
}
