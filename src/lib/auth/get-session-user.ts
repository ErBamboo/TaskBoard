import { cache } from "react";

import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import type { UserRole } from "@/lib/permissions";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type SessionUser = {
  displayName: string;
  email: string;
  id: string;
  role: UserRole;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    if (!hasPublicEnvironmentConfiguration(process.env)) {
      return null;
    }

    const supabaseClient = await getServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("id, email, display_name, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      role: profile.role,
    };
  } catch {
    return null;
  }
});
