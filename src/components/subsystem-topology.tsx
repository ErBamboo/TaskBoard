"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type SubsystemNode = {
  id: string;
  name: string;
  status: "normal" | "warning" | "error";
  taskCount: number;
};

type SubsystemTopologyProps = {
  subsystems: Array<{ id: string; name: string }>;
  tasks: Array<{ subsystemId: string; status: string; priority: string }>;
};

// 预定义的机器人子系统分类关键词，用于辅助布局
const CATEGORY_MAP: Record<string, number> = {
  "视觉": 1, "Vision": 1, "感知": 1, "Sensing": 1, "Camera": 1,
  "算法": 2, "Algo": 2, "规划": 2, "Planning": 2, "Control": 2, "电控": 2,
  "机械": 3, "Mech": 3, "底盘": 3, "Chassis": 3, "云台": 3, "Gimbal": 3, "执行": 3,
};

export function SubsystemTopology({ subsystems, tasks }: SubsystemTopologyProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeSubsystemId = searchParams.get("subsystemId");

  const nodes = useMemo(() => {
    return subsystems.map(s => {
      const subTasks = tasks.filter(t => t.subsystemId === s.id);
      const hasError = subTasks.some(t => t.status === "blocked" || t.priority === "urgent");
      const hasWarning = subTasks.some(t => t.priority === "high");
      
      let category = 2; // 默认中间层
      for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (s.name.includes(key)) {
          category = val;
          break;
        }
      }

      return {
        id: s.id,
        name: s.name,
        status: hasError ? "error" : hasWarning ? "warning" : "normal",
        taskCount: subTasks.length,
        category,
      } as SubsystemNode & { category: number };
    });
  }, [subsystems, tasks]);

  const handleNodeClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSubsystemId === id) {
      params.delete("subsystemId");
    } else {
      params.set("subsystemId", id);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 分层布局逻辑
  const layers = [
    nodes.filter(n => n.category === 1),
    nodes.filter(n => n.category === 2),
    nodes.filter(n => n.category === 3),
  ];

  return (
    <section className="w-full overflow-hidden rounded-[2.5rem] border border-[var(--color-line-strong)] bg-white/25 p-8 backdrop-blur-md transition-all hover:bg-white/35">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-[var(--color-muted)]">
              System Architecture Topology
            </p>
          </div>
          <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-2xl uppercase tracking-[0.1em] text-[var(--color-ink)]">
            子系统研发拓扑
          </h2>
        </div>
        
        <div className="flex gap-8 border-l border-[var(--color-line)] pl-8 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--color-muted-strong)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full border border-current opacity-40" />
            <span>Sensing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full border border-current opacity-40" />
            <span>Logic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full border border-current opacity-40" />
            <span>Actuation</span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-around md:gap-16 lg:px-12">
        {/* 背景装饰线 (仅在大屏幕显示，简化版连接逻辑) */}
        <div className="absolute inset-0 pointer-events-none hidden opacity-10 md:block">
          <svg className="h-full w-full">
             <path d="M 50,50% L 950,50%" stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="4 8" fill="none" />
          </svg>
        </div>

        {layers.map((layer, layerIdx) => (
          <div key={layerIdx} className="relative z-10 flex flex-1 flex-col gap-5">
            <div className="mb-2 text-center">
               <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[var(--color-muted)] opacity-60">
                 Layer {layerIdx + 1}
               </span>
            </div>
            
            {layer.length > 0 ? (
              layer.map(node => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className={[
                    "group relative flex flex-col items-start rounded-2xl border px-5 py-4 text-left transition-all duration-500",
                    activeSubsystemId === node.id 
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_12px_24px_-8px_var(--color-ink)] scale-[1.03]" 
                      : "border-[var(--color-line-strong)] bg-white/60 hover:border-[var(--color-accent)] hover:translate-y-[-3px] hover:shadow-xl hover:bg-white",
                    node.status === "error" && activeSubsystemId !== node.id ? "border-[var(--color-accent)] shadow-[0_0_15px_rgba(204,75,27,0.1)]" : ""
                  ].join(" ")}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-[0.85rem] font-bold tracking-tight">
                      {node.name}
                    </span>
                    {node.status === "error" && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-ping" />
                    )}
                  </div>
                  
                  <div className="mt-4 flex w-full items-end justify-between">
                    <div className="space-y-0.5">
                      <p className="font-mono text-[0.55rem] uppercase tracking-wider opacity-60">Status</p>
                      <p className={[
                        "text-[0.65rem] font-bold uppercase tracking-widest",
                        node.status === "error" ? "text-[var(--color-accent)]" : 
                        node.status === "warning" ? "text-[#cc8b1b]" : "text-[#106875]"
                      ].join(" ")}>
                        {node.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[0.55rem] uppercase tracking-wider opacity-60">Load</p>
                      <p className="text-[0.65rem] font-bold">{node.taskCount} Units</p>
                    </div>
                  </div>
                  
                  {/* 装饰性科技感刻度 */}
                  <div className="absolute -left-px top-1/2 h-4 w-[2px] -translate-y-1/2 bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            ) : (
              <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-[var(--color-line-strong)] bg-transparent opacity-20">
                <span className="font-mono text-[0.5rem] uppercase tracking-widest">Idle Segment</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-line)] opacity-30" />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.5em] text-[var(--color-muted)] opacity-60">
          Digital Twin Mapping Active
        </p>
        <div className="h-px flex-1 bg-[var(--color-line)] opacity-30" />
      </div>
    </section>
  );
}
