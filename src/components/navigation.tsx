"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { UserRole } from "@/lib/permissions";

type NavigationProperties = {
  role: UserRole;
};

type NavigationItem = {
  href: string;
  label: string;
};

const memberNavigationItems: NavigationItem[] = [
  {
    href: "/my-tasks",
    label: "我的任务",
  },
  {
    href: "/projects",
    label: "项目",
  },
];

const adminNavigationItems: NavigationItem[] = [
  ...memberNavigationItems,
  {
    href: "/admin",
    label: "管理",
  },
];

function isCurrentLink(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function Navigation({ role }: NavigationProperties) {
  const pathname = usePathname();
  const navigationItems =
    role === "admin" ? adminNavigationItems : memberNavigationItems;

  return (
    <nav className="flex flex-wrap items-center gap-3">
      {navigationItems.map((navigationItem) => {
        const isActive = isCurrentLink(pathname, navigationItem.href);

        return (
          <Link
            key={navigationItem.href}
            href={navigationItem.href}
            className={[
              "relative rounded-full px-5 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.24em] transition-all duration-300",
              isActive
                ? "scale-[1.02] bg-[var(--color-ink)] text-[var(--color-panel)] shadow-[0_8px_16px_-6px_var(--color-ink)]"
                : "bg-transparent text-[var(--color-muted-strong)] hover:bg-[rgba(31,36,38,0.06)] hover:text-[var(--color-ink)] hover:translate-y-[-1px]",
            ].join(" ")}
          >
            {navigationItem.label}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
