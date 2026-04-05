import { persistentAtom } from "@nanostores/persistent";

export type PkgManager = "pnpm" | "npm" | "yarn" | "bun";

export const $pkgManager = persistentAtom<PkgManager>("pkg-manager", "pnpm");
