import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import {
  assertDesktopBuildConfiguration,
  resolveDesktopBuildEnvironment,
  resolveTauriLaunchConfiguration,
} from "./desktop-build-env.js";

function resolveEnvironmentFileContents(projectRoot) {
  const environmentFilePaths = [
    path.join(projectRoot, ".env"),
    path.join(projectRoot, ".env.local"),
  ];

  return environmentFilePaths
    .filter((environmentFilePath) => existsSync(environmentFilePath))
    .map((environmentFilePath) =>
      readFileSync(environmentFilePath, "utf8"),
    );
}

function main() {
  const projectRoot = process.cwd();
  const tauriArguments = process.argv.slice(2);
  const cargoBinDirectory = path.join(os.homedir(), ".cargo", "bin");
  const launchConfiguration = resolveTauriLaunchConfiguration({
    projectRoot,
    tauriArguments,
    nodeExecutablePath: process.execPath,
  });
  const resolvedEnvironment = resolveDesktopBuildEnvironment({
    processEnv: process.env,
    environmentFileContents: resolveEnvironmentFileContents(projectRoot),
    cargoBinDirectory,
    cargoBinExists: existsSync(cargoBinDirectory),
    platform: process.platform,
  });

  assertDesktopBuildConfiguration({
    tauriArguments,
    resolvedEnvironment,
  });

  const childProcess = spawn(launchConfiguration.command, launchConfiguration.args, {
    stdio: "inherit",
    env: resolvedEnvironment,
  });

  childProcess.on("exit", (exitCode) => {
    process.exit(exitCode ?? 1);
  });

  childProcess.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
}

main();
