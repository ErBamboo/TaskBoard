import { redirect } from "next/navigation";

import { WelcomeLanding } from "@/features/home/welcome-landing";
import { shouldRedirectAdminToSetup } from "@/features/setup/setup-routing";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getSetupState } from "@/features/setup/get-setup-state";

export default async function HomePage() {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    if (sessionUser.role === "admin") {
      const setupState = await getSetupState();

      if (
        shouldRedirectAdminToSetup({
          role: sessionUser.role,
          isInitialized: setupState.isInitialized,
        })
      ) {
        redirect("/setup");
      }
    }

    redirect("/my-tasks");
  }

  return <WelcomeLanding />;
}
