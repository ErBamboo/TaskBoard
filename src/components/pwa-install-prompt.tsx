"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type PwaInstallPromptProperties = {
  variant: "compact" | "hero";
};

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneByMediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false;

  return (
    standaloneByMediaQuery ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function subscribeToStandaloneMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQueryList =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(display-mode: standalone)")
      : null;
  const handleChange = () => onStoreChange();

  window.addEventListener("appinstalled", handleChange);

  if (mediaQueryList) {
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
    } else if (typeof mediaQueryList.addListener === "function") {
      mediaQueryList.addListener(handleChange);
    }
  }

  return () => {
    window.removeEventListener("appinstalled", handleChange);

    if (!mediaQueryList) {
      return;
    }

    if (typeof mediaQueryList.removeEventListener === "function") {
      mediaQueryList.removeEventListener("change", handleChange);
    } else if (typeof mediaQueryList.removeListener === "function") {
      mediaQueryList.removeListener(handleChange);
    }
  };
}

export function PwaInstallPrompt({ variant }: PwaInstallPromptProperties) {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const isInstalled = useSyncExternalStore(
    subscribeToStandaloneMode,
    isStandaloneDisplayMode,
    () => false,
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setShowManualSteps(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPromptEvent) {
      setShowManualSteps((currentValue) => !currentValue);
      return;
    }

    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  }

  if (isInstalled) {
    return variant === "hero" ? (
      <div className="rounded-[1.35rem] border border-[rgba(16,104,117,0.24)] bg-[rgba(16,104,117,0.1)] px-4 py-4 text-sm leading-7 text-[#106875]">
        当前设备已添加到主屏幕，可像应用一样直接打开。
      </div>
    ) : null;
  }

  if (variant === "compact") {
    return (
      <div className="grid gap-3 rounded-[1.3rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.26em] text-[#106875]">
            Installable console
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted-strong)]">
            可将任务面板固定到桌面或主屏幕，像应用一样直接进入。
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-full border border-[rgba(16,104,117,0.28)] bg-[var(--color-panel)] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#106875] transition-transform duration-200 hover:-translate-y-0.5"
        >
          安装到设备
        </button>
        {showManualSteps ? (
          <p className="sm:col-span-2 text-sm leading-7 text-[#106875]">
            如果浏览器没有弹出安装框，可使用浏览器菜单中的“安装应用”或“添加到主屏幕”。
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-[1.7rem] border border-[rgba(16,104,117,0.24)] bg-[linear-gradient(180deg,_rgba(16,104,117,0.12),_rgba(255,255,255,0.72))] p-5 shadow-[6px_6px_0_var(--color-shadow)]">
      <div className="space-y-2">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#106875]">
          Deploy to device
        </p>
        <h3 className="text-2xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
          像战队应用一样打开
        </h3>
        <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
          将面板固定到桌面或主屏幕。下次不需要再记网址，直接点开即可进入任务中枢。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          安装到设备
        </button>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Chrome / Edge / Safari 均可
        </p>
      </div>

      {showManualSteps ? (
        <div className="grid gap-2 rounded-[1.1rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm leading-7 text-[var(--color-muted-strong)]">
          <p>桌面端：打开浏览器菜单，选择“安装应用”或“创建快捷方式”。</p>
          <p>iPhone / iPad：使用 Safari 打开后，点击“分享”，再选择“添加到主屏幕”。</p>
          <p>安卓：打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。</p>
        </div>
      ) : null}
    </div>
  );
}
