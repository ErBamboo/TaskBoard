export function parseEnvironmentFile(
  fileContent: string,
): Record<string, string>;

export function prependPathEntry(
  currentPath: string | undefined,
  nextEntry: string,
): string;

export function resolveDesktopBuildEnvironment(input: {
  processEnv: Record<string, string | undefined>;
  environmentFileContents: string[];
  cargoBinDirectory: string;
  cargoBinExists: boolean;
  platform?: string;
}): Record<string, string | undefined>;

export function resolveTauriLaunchConfiguration(input: {
  projectRoot: string;
  tauriArguments: string[];
  nodeExecutablePath: string;
}): {
  command: string;
  args: string[];
};

export function assertDesktopBuildConfiguration(input: {
  tauriArguments: string[];
  resolvedEnvironment: Record<string, string | undefined>;
}): void;
