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
    console.error("[getSetupState] team_settings query failed", {
      code: teamSettingsResult.error.code,
      details: teamSettingsResult.error.details,
      hint: teamSettingsResult.error.hint,
      message: teamSettingsResult.error.message,
    });
    throw new Error(
      `Failed to load team settings: ${teamSettingsResult.error.message}`,
    );
  }

  if (projectsResult.error) {
    console.error("[getSetupState] projects query failed", {
      code: projectsResult.error.code,
      details: projectsResult.error.details,
      hint: projectsResult.error.hint,
      message: projectsResult.error.message,
    });
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
