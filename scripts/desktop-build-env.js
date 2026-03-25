import path from "node:path";
import process from "node:process";

export function parseEnvironmentFile(fileContent) {
  const environmentEntries = {};

  for (const fileLine of fileContent.split(/\r?\n/u)) {
    const trimmedLine = fileLine.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const environmentKey = trimmedLine.slice(0, separatorIndex).trim();
    let environmentValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (environmentValue.startsWith('"') && environmentValue.endsWith('"')) ||
      (environmentValue.startsWith("'") && environmentValue.endsWith("'"))
    ) {
      environmentValue = environmentValue.slice(1, -1);
    }

    environmentEntries[environmentKey] = environmentValue;
  }

  return environmentEntries;
}

export function prependPathEntry(currentPath, nextEntry) {
  if (!nextEntry) {
    return currentPath ?? "";
  }

  const pathEntries = (currentPath ?? "")
    .split(path.delimiter)
    .filter(Boolean);

  if (pathEntries.includes(nextEntry)) {
    return pathEntries.join(path.delimiter);
  }

  return [nextEntry, ...pathEntries].join(path.delimiter);
}

function resolveCaseInsensitiveEnvironmentKey(environment, keyName) {
  return Object.keys(environment).find(
    (environmentKey) =>
      environmentKey.localeCompare(keyName, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
}

function normalizeWindowsPathEnvironment(environment) {
  const resolvedEnvironment = {
    ...environment,
  };
  const pathEnvironmentKey = resolveCaseInsensitiveEnvironmentKey(
    resolvedEnvironment,
    "PATH",
  );
  const currentPathValue = pathEnvironmentKey
    ? resolvedEnvironment[pathEnvironmentKey]
    : "";

  for (const environmentKey of Object.keys(resolvedEnvironment)) {
    if (
      environmentKey !== "PATH" &&
      environmentKey.localeCompare("PATH", undefined, {
        sensitivity: "accent",
      }) === 0
    ) {
      delete resolvedEnvironment[environmentKey];
    }
  }

  resolvedEnvironment.PATH = currentPathValue;

  return resolvedEnvironment;
}

export function resolveDesktopBuildEnvironment({
  processEnv,
  environmentFileContents,
  cargoBinDirectory,
  cargoBinExists,
  platform = process.platform,
}) {
  let resolvedEnvironment = {
    ...processEnv,
  };

  for (const environmentFileContent of environmentFileContents) {
    const parsedEnvironmentFile = parseEnvironmentFile(environmentFileContent);

    for (const [environmentKey, environmentValue] of Object.entries(
      parsedEnvironmentFile,
    )) {
      if (!resolvedEnvironment[environmentKey]) {
        resolvedEnvironment[environmentKey] = environmentValue;
      }
    }
  }

  if (platform === "win32") {
    resolvedEnvironment = normalizeWindowsPathEnvironment(resolvedEnvironment);
  }

  if (cargoBinExists) {
    resolvedEnvironment.PATH = prependPathEntry(
      resolvedEnvironment.PATH,
      cargoBinDirectory,
    );
  }

  return resolvedEnvironment;
}

export function resolveTauriLaunchConfiguration({
  projectRoot,
  tauriArguments,
  nodeExecutablePath,
}) {
  const tauriExecutablePath = path.join(
    projectRoot,
    "node_modules",
    "@tauri-apps",
    "cli",
    "tauri.js",
  );

  return {
    command: nodeExecutablePath,
    args: [tauriExecutablePath, ...tauriArguments],
  };
}

export function assertDesktopBuildConfiguration({
  tauriArguments,
  resolvedEnvironment,
}) {
  const isDesktopBuildCommand = tauriArguments.includes("build");

  if (
    isDesktopBuildCommand &&
    !resolvedEnvironment.NEXT_PUBLIC_DESKTOP_APP_URL
  ) {
    throw new Error(
      "NEXT_PUBLIC_DESKTOP_APP_URL is required for desktop builds.",
    );
  }
}
