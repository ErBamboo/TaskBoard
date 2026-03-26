"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Command = {
  id: string;
  label: string;
  action: () => void;
  shortcut?: string;
  category: string;
};

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const commands: Command[] = [
    {
      id: "nav-tasks",
      label: "前往 我的任务",
      category: "导航",
      action: () => router.push("/my-tasks"),
    },
    {
      id: "nav-projects",
      label: "前往 项目列表",
      category: "导航",
      action: () => router.push("/projects"),
    },
    {
      id: "nav-admin",
      label: "前往 管理控制台",
      category: "导航",
      action: () => router.push("/admin"),
    },
    {
      id: "action-new-task",
      label: "录入新任务 (当前项目)",
      category: "操作",
      action: () => {
        const path = window.location.pathname;
        if (path.startsWith("/projects/")) {
          router.push(`${path}?new=true`);
        } else {
          alert("请先进入具体项目页面");
        }
      },
    },
    {
      id: "theme-light",
      label: "切换 浅色模式",
      category: "设置",
      action: () => console.log("Light theme"),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      <div 
        className="fixed inset-0 bg-[rgba(31,36,38,0.4)] backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.98)] shadow-[0_32px_64px_-16px_rgba(17,21,22,0.4)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-[var(--color-line)] px-6 py-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-muted)]">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            autoFocus
            placeholder="键入命令或搜索功能... (Cmd+K)"
            className="ml-4 w-full bg-transparent text-lg text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredCommands.length > 0) {
                filteredCommands[0].action();
                setIsOpen(false);
              }
            }}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            <div className="space-y-4 py-2">
              {["导航", "操作", "设置"].map((cat) => {
                const catCmds = filteredCommands.filter(c => c.category === cat);
                if (catCmds.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <p className="px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      {cat}
                    </p>
                    {catCmds.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--color-ink)] hover:text-white group"
                      >
                        <span className="flex-1 text-sm font-medium tracking-wide">
                          {cmd.label}
                        </span>
                        <span className="font-mono text-[0.6rem] opacity-40 group-hover:opacity-100">
                          EXECUTE
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[var(--color-muted)]">未找到匹配的命令</p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-line)] bg-[rgba(31,36,38,0.03)] px-6 py-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--color-muted)]">
            TIP: 使用 <span className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-[var(--color-ink)]">↑↓</span> 选择，<span className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-[var(--color-ink)]">Enter</span> 执行
          </p>
        </div>
      </div>
    </div>
  );
}
