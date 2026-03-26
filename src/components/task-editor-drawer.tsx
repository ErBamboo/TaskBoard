"use client";

import { ReactNode, useEffect, useSyncExternalStore } from "react";

type TaskEditorDrawerProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const emptySubscribe = () => () => {};

export function TaskEditorDrawer({
  children,
  isOpen,
  onClose,
  title,
}: TaskEditorDrawerProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMounted]);

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-[100] bg-[rgba(31,36,38,0.4)] backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-[101] h-screen w-full max-w-xl border-l border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.98)] p-6 shadow-[-12px_0_40px_-12px_rgba(17,21,22,0.24)] backdrop-blur-md transition-transform duration-500 ease-out sm:p-8",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
                Mission Editor
              </p>
              <h2 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-3xl uppercase tracking-[0.1em] text-[var(--color-ink)]">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-[var(--color-line)] p-3 text-[var(--color-muted)] transition-all hover:bg-[var(--color-ink)] hover:text-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-line);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-muted);
        }
      `}</style>
    </>
  );
}
