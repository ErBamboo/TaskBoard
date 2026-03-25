import Link from "next/link";

import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

const tacticalCapabilities = [
  {
    title: "我的任务",
    body: "成员进入后只看自己当前该推进的事项，减少会议上下文切换成本。",
    accent: "待命 / 执行 / 阻塞",
  },
  {
    title: "项目战况",
    body: "按机器人或比赛模块查看整体推进，不再被技术组边界打散视角。",
    accent: "项目 / 子系统 / 任务",
  },
  {
    title: "联调预警",
    body: "将跨组联调单独标亮，优先暴露真正卡住整车推进的依赖链路。",
    accent: "联调 / 依赖 / 阻塞",
  },
  {
    title: "里程碑推进",
    body: "围绕阶段目标检查完成度，而不是只看零散任务是否有人认领。",
    accent: "目标 / 检查点 / 节奏",
  },
] as const;

const commandPreviewCards = [
  {
    title: "底盘与云台联调",
    status: "进行中",
    note: "联调窗口已开启，等待视觉协议固化。",
  },
  {
    title: "视觉识别模型验证",
    status: "待开始",
    note: "今日优先完成室内目标样本回归。",
  },
  {
    title: "第一次全车联调",
    status: "阻塞",
    note: "当前阻塞点：嵌入式串口字段待确认。",
  },
] as const;

export function WelcomeLanding() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:px-10 lg:py-10">
      <section className="grid gap-8 overflow-hidden rounded-[2.2rem] border border-[var(--color-line-strong)] bg-[radial-gradient(circle_at_top_left,_rgba(204,75,27,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,104,117,0.16),_transparent_28%),linear-gradient(180deg,_rgba(249,246,239,0.98),_rgba(239,233,221,0.96))] p-6 shadow-[10px_10px_0_var(--color-shadow)] lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
        <div className="grid gap-6">
          <div className="space-y-4">
            <p className="font-mono text-[0.74rem] uppercase tracking-[0.36em] text-[var(--color-accent)]">
              Team mission gateway
            </p>
            <div className="space-y-4">
              <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-5xl uppercase tracking-[0.1em] text-[var(--color-ink)] sm:text-6xl">
                战队任务中枢
              </h1>
              <p className="max-w-3xl text-lg leading-9 text-[var(--color-muted-strong)]">
                为机器人竞赛项目、联调和里程碑准备的在线作战面板。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.74rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              进入任务面板
            </Link>
            <PwaInstallPrompt variant="hero" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-[1.3rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Team Mode
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                6-8 人协同
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] p-4">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#106875]">
                Object Model
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                项目驱动
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-[rgba(204,75,27,0.22)] bg-[rgba(204,75,27,0.08)] p-4">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Priority
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                联调优先
              </p>
            </article>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.8rem] border border-[var(--color-line-strong)] bg-[rgba(24,29,31,0.92)] p-5 text-[var(--color-panel)] shadow-[8px_8px_0_rgba(17,21,22,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-[rgba(233,225,211,0.62)]">
                Tactical preview
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[0.04em]">
                今日战况预览
              </h2>
            </div>
            <span className="rounded-full border border-[rgba(233,225,211,0.18)] bg-[rgba(233,225,211,0.08)] px-3 py-1 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#f2b199]">
              Live style
            </span>
          </div>

          <div className="grid gap-3">
            {commandPreviewCards.map((previewCard) => (
              <article
                key={previewCard.title}
                className="grid gap-2 rounded-[1.15rem] border border-[rgba(233,225,211,0.12)] bg-[rgba(255,255,255,0.04)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold tracking-[0.04em]">
                    {previewCard.title}
                  </h3>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#f2b199]">
                    {previewCard.status}
                  </span>
                </div>
                <p className="text-sm leading-7 text-[rgba(233,225,211,0.74)]">
                  {previewCard.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {tacticalCapabilities.map((tacticalCapability) => (
          <article
            key={tacticalCapability.title}
            className="grid gap-4 rounded-[1.7rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.9)] p-5 shadow-[6px_6px_0_var(--color-shadow)]"
          >
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.28em] text-[var(--color-accent)]">
              {tacticalCapability.accent}
            </p>
            <h2 className="text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {tacticalCapability.title}
            </h2>
            <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
              {tacticalCapability.body}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[linear-gradient(180deg,_rgba(249,246,239,0.92),_rgba(241,236,226,0.9))] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-accent)]">
            First use
          </p>
          <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.08em] text-[var(--color-ink)]">
            像 APP 一样开始使用
          </h2>
          <p className="text-base leading-8 text-[var(--color-muted-strong)]">
            域名就是入口。成员登录后直接进入“我的任务”，管理员则在控制台中维护项目、子系统与里程碑。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-[1.3rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              01
            </p>
            <p className="mt-3 text-base font-semibold text-[var(--color-ink)]">
              打开固定入口
            </p>
          </article>
          <article className="rounded-[1.3rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              02
            </p>
            <p className="mt-3 text-base font-semibold text-[var(--color-ink)]">
              登录后直达任务面板
            </p>
          </article>
          <article className="rounded-[1.3rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              03
            </p>
            <p className="mt-3 text-base font-semibold text-[var(--color-ink)]">
              安装到主屏幕或桌面
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
