import { z } from "zod";

const desktopRuntimeConfigurationSchema = z.object({
  NEXT_PUBLIC_DESKTOP_APP_URL: z.string().min(1).url(),
});

export type DesktopRuntimeConfiguration = {
  appUrl: string;
};

export function parseDesktopRuntimeConfiguration(
  input: Record<string, string | undefined>,
): DesktopRuntimeConfiguration {
  const environment = desktopRuntimeConfigurationSchema.parse({
    NEXT_PUBLIC_DESKTOP_APP_URL: input.NEXT_PUBLIC_DESKTOP_APP_URL,
  });

  return {
    appUrl: environment.NEXT_PUBLIC_DESKTOP_APP_URL,
  };
}
