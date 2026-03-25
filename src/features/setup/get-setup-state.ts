import { cache } from "react";

import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type SetupStateResponse = {
  isInitialized: boolean;
  teamSettings: {
    seasonName: string;
    teamName: string;
  } | null;
};

export const getSetupState = cache(async (): Promise<SetupStateResponse> => {
  if (!hasPublicEnvironmentConfiguration(process.env)) {
    return {
      isInitialized: false,
      teamSettings: null,
    };
  }

  const supabaseClient = await getServerSupabaseClient();

  const [teamSettingsResult, projectsResult] = await Promise.all([
    supabaseClient
      .from("team_settings")
      .select("team_name, season_name")
      .eq("id", 1)
      .maybeSingle(),
    supabaseClient.from("projects").select("id").limit(1),
  ]);

  if (teamSettingsResult.error) {
    throw new Error(
      `Failed to load team settings: ${teamSettingsResult.error.message}`,
    );
  }

  if (projectsResult.error) {
    throw new Error(`Failed to load setup state: ${projectsResult.error.message}`);
  }

  return {
    isInitialized: (projectsResult.data ?? []).length > 0,
    teamSettings: teamSettingsResult.data
      ? {
          teamName: teamSettingsResult.data.team_name,
          seasonName: teamSettingsResult.data.season_name,
        }
      : null,
  };
});
