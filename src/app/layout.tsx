import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";

type RootLayoutProperties = {
  children: ReactNode;
};

export const metadata: Metadata = {
  applicationName: "Robot Task Board",
  title: {
    default: "Robot Task Board",
    template: "%s | Robot Task Board",
  },
  description: "Robot Task Board is a mission-driven online command surface for robotics competition teams.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Robot Task Board",
  },
  icons: {
    icon: [{ url: "/icons/robot-task-board-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/robot-task-board-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#151a1d",
};

export default function RootLayout({ children }: RootLayoutProperties) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(204,75,27,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,104,117,0.2),_transparent_30%),linear-gradient(0deg,_transparent_24px,_rgba(31,36,38,0.06)_25px),linear-gradient(90deg,_transparent_24px,_rgba(31,36,38,0.06)_25px)] bg-[length:auto,auto,25px_25px,25px_25px]" />
        <div className="border-b border-[var(--color-line)] bg-[rgba(243,239,229,0.92)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[var(--color-muted)]">
                Robotics Internal Operations
              </p>
              <p className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-xl uppercase tracking-[0.18em] text-[var(--color-ink)]">
                Robot Task Board
              </p>
            </div>
            <div className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-accent)] shadow-[4px_4px_0_var(--color-shadow)]">
              Team Ops Console
            </div>
          </div>
        </div>
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
