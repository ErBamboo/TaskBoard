"use client";

import { useSyncExternalStore } from "react";

type DesktopRuntimeStatusProperties = {
  clientVersion: string | null;
};

function subscribeToDesktopConnectivity(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getDesktopConnectivitySnapshot() {
  return navigator.onLine;
}

function getDesktopConnectivityServerSnapshot() {
  return true;
}

export function DesktopRuntimeStatus({
  clientVersion,
}: DesktopRuntimeStatusProperties) {
  const isOnline = useSyncExternalStore(
    subscribeToDesktopConnectivity,
    getDesktopConnectivitySnapshot,
    getDesktopConnectivityServerSnapshot,
  );

  return (
    <div className="grid gap-3 rounded-[1.3rem] border border-[rgba(16,104,117,0.24)] bg-[rgba(16,104,117,0.08)] p-4 text-sm leading-7 text-[var(--color-muted-strong)] lg:grid-cols-2">
      <article className="rounded-[1.05rem] border border-[rgba(16,104,117,0.16)] bg-[rgba(255,255,255,0.72)] p-4">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-[#106875]">
          Link status
        </p>
        <p className="mt-3 text-base font-semibold tracking-[0.05em] text-[var(--color-ink)]">
          {isOnline ? "在线同步" : "离线"}
        </p>
        <p className="mt-1 text-sm leading-7 text-[var(--color-muted-strong)]">
          {isOnline
            ? "当前客户端已连接到任务中枢，任务与状态变更可实时同步。"
            : "网络已断开，当前无法同步任务或提交变更。"}
        </p>
      </article>

      <article className="rounded-[1.05rem] border border-[rgba(16,104,117,0.16)] bg-[rgba(255,255,255,0.72)] p-4">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-[#106875]">
          Client build
        </p>
        <p className="mt-3 text-base font-semibold tracking-[0.05em] text-[var(--color-ink)]">
          {clientVersion ? `v${clientVersion}` : "桌面构建"}
        </p>
        <p className="mt-1 text-sm leading-7 text-[var(--color-muted-strong)]">
          当前这台设备运行的 Windows 客户端版本。
        </p>
      </article>
    </div>
  );
}
