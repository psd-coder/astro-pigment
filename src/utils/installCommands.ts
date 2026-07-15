import type { PkgManager } from "../stores/pkgManager";

const MANAGERS = [
  { id: "pnpm", add: "pnpm add", devFlag: " -D" },
  { id: "npm", add: "npm install", devFlag: " --save-dev" },
  { id: "yarn", add: "yarn add", devFlag: " -D" },
  { id: "bun", add: "bun add", devFlag: " -d" },
] as const satisfies ReadonlyArray<{ id: PkgManager; add: string; devFlag: string }>;

export type InstallCommand = { id: PkgManager; content: string };

export function installCommands(pkg: string, dev = false): InstallCommand[] {
  return MANAGERS.map(({ id, add, devFlag }) => ({
    id,
    content: `${add}${dev ? devFlag : ""} ${pkg}`,
  }));
}
