import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnvironment } from "@/lib/env";

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

type CookieWriteOperation = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function getServerSupabaseClient() {
  const cookieStore = await cookies();
  const environment = getPublicEnvironment();

  return createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieWriteOperations: CookieWriteOperation[]) {
          try {
            cookieWriteOperations.forEach((cookieWriteOperation) => {
              cookieStore.set(
                cookieWriteOperation.name,
                cookieWriteOperation.value,
                cookieWriteOperation.options,
              );
            });
          } catch {
            // Server Components may not be allowed to mutate cookies on read.
          }
        },
      },
    },
  );
}
