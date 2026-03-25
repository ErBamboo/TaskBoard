import Link from "next/link";

import type { UserRole } from "@/lib/permissions";

type NavigationProperties = {
  currentPath: string;
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

export function Navigation({ currentPath, role }: NavigationProperties) {
  const navigationItems =
    role === "admin" ? adminNavigationItems : memberNavigationItems;

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navigationItems.map((navigationItem) => {
        const isActive = isCurrentLink(currentPath, navigationItem.href);

        return (
          <Link
            key={navigationItem.href}
            href={navigationItem.href}
            className={[
              "rounded-full border px-4 py-2 text-sm uppercase tracking-[0.18em] transition-colors duration-200",
              isActive
                ? "border-[var(--color-line-strong)] bg-[var(--color-ink)] text-[var(--color-panel)]"
                : "border-[var(--color-line)] bg-[rgba(255,255,255,0.55)] text-[var(--color-muted-strong)] hover:border-[var(--color-line-strong)] hover:bg-[var(--color-panel)]",
            ].join(" ")}
          >
            {navigationItem.label}
          </Link>
        );
      })}
    </nav>
  );
}
