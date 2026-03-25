import { createBrowserClient } from "@supabase/ssr";

import { parsePublicEnvironment } from "@/lib/env";

let browserSupabaseClient:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export function getBrowserSupabaseClient() {
  if (!browserSupabaseClient) {
    const environment = parsePublicEnvironment(process.env);

    browserSupabaseClient = createBrowserClient(
      environment.NEXT_PUBLIC_SUPABASE_URL,
      environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserSupabaseClient;
}
