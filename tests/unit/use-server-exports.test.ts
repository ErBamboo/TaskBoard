import { readFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "..", "..");

const useServerActionFiles = [
  "src/features/admin/actions.ts",
  "src/features/tasks/actions.ts",
  "src/features/setup/actions.ts",
] as const;

test.each(useServerActionFiles)(
  "%s does not re-export action state objects from a use server module",
  (relativePath) => {
    const fileContent = readFileSync(
      path.join(repositoryRoot, relativePath),
      "utf8",
    );

    expect(fileContent).not.toMatch(/export\s*\{\s*initial\w+ActionState\s*\};/);
  },
);
