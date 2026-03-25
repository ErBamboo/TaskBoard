import { cache } from "react";

import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function hasPublicEnvironmentConfiguration(
  input: Record<string, string | undefined>,
) {
  return Boolean(
    input.NEXT_PUBLIC_SUPABASE_URL && input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function parsePublicEnvironment(
  input: Record<string, string | undefined>,
): PublicEnvironment {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function parseEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
  return serverEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: input.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export const getPublicEnvironment = cache(() =>
  parsePublicEnvironment(process.env),
);

export const getServerEnvironment = cache(() => parseEnvironment(process.env));
