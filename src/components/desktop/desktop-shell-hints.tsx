import { DesktopRuntimeStatus } from "@/components/desktop/desktop-runtime-status";

type DesktopShellHintsProperties = {
  clientVersion?: string | null;
  mode: "app" | "login";
};

export function DesktopShellHints({
  clientVersion = null,
  mode,
}: DesktopShellHintsProperties) {
  if (mode === "login") {
    return (
      <div className="rounded-[1.4rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] px-4 py-4 text-sm leading-7 text-[var(--color-muted-strong)]">
        当前通过 Windows 客户端访问。首次登录后会保留会话，下次双击桌面图标可直接回到任务面板。
        {clientVersion ? ` 当前客户端版本为 v${clientVersion}。` : null}
      </div>
    );
  }

  return (
    <DesktopRuntimeStatus clientVersion={clientVersion} />
  );
}
