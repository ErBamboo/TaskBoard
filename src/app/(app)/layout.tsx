import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { signOutAction } from "@/app/(app)/actions";
import { getSessionUser } from "@/lib/auth/get-session-user";

type AuthenticatedLayoutProperties = {
  children: ReactNode;
};

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProperties) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  return (
    <AppShell signOutAction={signOutAction} user={sessionUser}>
      {children}
    </AppShell>
  );
}
