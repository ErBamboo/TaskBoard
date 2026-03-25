import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertDesktopBuildConfiguration,
  parseEnvironmentFile,
  prependPathEntry,
  resolveTauriLaunchConfiguration,
  resolveDesktopBuildEnvironment,
} from "../../scripts/desktop-build-env.js";

describe("desktop build environment", () => {
  it("loads NEXT_PUBLIC_DESKTOP_APP_URL from environment file content", () => {
    const resolvedEnvironment = resolveDesktopBuildEnvironment({
      processEnv: {
        PATH: "C:\\Windows\\System32",
      },
      environmentFileContents: [
        "NEXT_PUBLIC_DESKTOP_APP_URL=https://task-board.real.example\n",
      ],
      cargoBinDirectory: "C:\\Users\\Administrator\\.cargo\\bin",
      cargoBinExists: false,
    });

    expect(resolvedEnvironment.NEXT_PUBLIC_DESKTOP_APP_URL).toBe(
      "https://task-board.real.example",
    );
  });

  it("keeps explicit shell variables ahead of .env.local values", () => {
    const resolvedEnvironment = resolveDesktopBuildEnvironment({
      processEnv: {
        NEXT_PUBLIC_DESKTOP_APP_URL: "https://task-board.shell.example",
        PATH: "C:\\Windows\\System32",
      },
      environmentFileContents: [
        "NEXT_PUBLIC_DESKTOP_APP_URL=https://task-board.file.example\n",
      ],
      cargoBinDirectory: "C:\\Users\\Administrator\\.cargo\\bin",
      cargoBinExists: false,
    });

    expect(resolvedEnvironment.NEXT_PUBLIC_DESKTOP_APP_URL).toBe(
      "https://task-board.shell.example",
    );
  });

  it("prepends cargo bin to PATH when it is available", () => {
    expect(
      resolveDesktopBuildEnvironment({
        processEnv: {
          PATH: "C:\\Windows\\System32",
        },
        environmentFileContents: [],
        cargoBinDirectory: "C:\\Users\\Administrator\\.cargo\\bin",
        cargoBinExists: true,
      }).PATH,
    ).toBe(
      "C:\\Users\\Administrator\\.cargo\\bin;C:\\Windows\\System32",
    );
  });

  it("normalizes a Windows Path variable to PATH before spawning child processes", () => {
    const resolvedEnvironment = resolveDesktopBuildEnvironment({
      processEnv: {
        Path: "C:\\Program Files\\nodejs;C:\\Windows\\System32",
      },
      environmentFileContents: [],
      cargoBinDirectory: "C:\\Users\\Administrator\\.cargo\\bin",
      cargoBinExists: true,
    });

    expect(resolvedEnvironment.PATH).toBe(
      "C:\\Users\\Administrator\\.cargo\\bin;C:\\Program Files\\nodejs;C:\\Windows\\System32",
    );
    expect("Path" in resolvedEnvironment).toBe(false);
  });

  it("parses quoted environment values and ignores comments", () => {
    expect(
      parseEnvironmentFile(
        "# comment\nNEXT_PUBLIC_DESKTOP_APP_URL=\"https://task-board.real.example\"\n",
      ),
    ).toEqual({
      NEXT_PUBLIC_DESKTOP_APP_URL: "https://task-board.real.example",
    });
  });

  it("does not duplicate path entries", () => {
    expect(
      prependPathEntry(
        "C:\\Users\\Administrator\\.cargo\\bin;C:\\Windows\\System32",
        "C:\\Users\\Administrator\\.cargo\\bin",
      ),
    ).toBe("C:\\Users\\Administrator\\.cargo\\bin;C:\\Windows\\System32");
  });

  it("launches the local tauri CLI through the current Node executable on Windows", () => {
    expect(
      resolveTauriLaunchConfiguration({
        projectRoot: "E:\\Oh-My-Robot-Lab\\Task-Board",
        tauriArguments: ["build", "--debug"],
        nodeExecutablePath: "C:\\Program Files\\nodejs\\node.exe",
      }),
    ).toEqual({
      command: "C:\\Program Files\\nodejs\\node.exe",
      args: [
        "E:\\Oh-My-Robot-Lab\\Task-Board\\node_modules\\@tauri-apps\\cli\\tauri.js",
        "build",
        "--debug",
      ],
    });
  });

  it("fails fast when desktop build URL is missing for a production bundle", () => {
    expect(() =>
      assertDesktopBuildConfiguration({
        tauriArguments: ["build"],
        resolvedEnvironment: {},
      }),
    ).toThrow(
      "NEXT_PUBLIC_DESKTOP_APP_URL is required for desktop builds.",
    );
  });

  it("uses a Windows wrapper script so desktop builds do not depend on node being in PATH", () => {
    const packageJson = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "package.json"),
        "utf8",
      ),
    ) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["tauri:build"]).toBe(
      "scripts\\run-tauri.cmd build",
    );
    expect(packageJson.scripts["tauri:dev"]).toBe(
      "scripts\\run-tauri.cmd dev",
    );
  });

  it("uses the cmd wrapper only to launch a PowerShell bootstrapper", () => {
    const wrapperScript = readFileSync(
      path.join(process.cwd(), "scripts", "run-tauri.cmd"),
      "utf8",
    );

    expect(wrapperScript).toContain(
      '%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    );
  });

  it("resolves node from npm metadata or the local shell inside the PowerShell wrapper", () => {
    const powershellWrapperScript = readFileSync(
      path.join(process.cwd(), "scripts", "run-tauri.ps1"),
      "utf8",
    );

    expect(powershellWrapperScript).toContain('$env:npm_node_execpath');
    expect(powershellWrapperScript).toContain("Get-Command node");
  });

  it("declares PowerShell parameters before any executable statements", () => {
    const powershellWrapperScript = readFileSync(
      path.join(process.cwd(), "scripts", "run-tauri.ps1"),
      "utf8",
    ).trimStart();

    expect(powershellWrapperScript.startsWith("param(")).toBe(true);
  });
});
