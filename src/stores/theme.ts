import { persistentAtom } from "@nanostores/persistent";
import { computed, effect } from "nanostores";

import { $prefersDarkScheme, $prefersReducedMotion } from "./media";

export type ThemeSetting = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_HUE = "180";
export const $hue = persistentAtom<string>("theme-hue", DEFAULT_HUE);

const CYCLE: ThemeSetting[] = ["auto", "light", "dark"];

export const $themeSetting = persistentAtom<ThemeSetting>("theme", "auto");

export const $resolvedTheme = computed(
  [$themeSetting, $prefersDarkScheme],
  (setting, prefersDark): ResolvedTheme => {
    if (setting === "auto") return prefersDark ? "dark" : "light";
    return setting;
  },
);

export function cycleTheme() {
  const current = $themeSetting.get();
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]!;
  $themeSetting.set(next);
}

function applyTheme(themeSetting: ThemeSetting, resolvedTheme: ResolvedTheme) {
  document.documentElement.dataset.themeSetting = themeSetting;
  document.documentElement.dataset.theme = resolvedTheme;
}

if (typeof window !== "undefined") {
  effect($themeSetting, (themeSetting) => {
    const resolvedTheme = $resolvedTheme.get();

    if ($prefersReducedMotion.get() || !document.startViewTransition) {
      applyTheme(themeSetting, resolvedTheme);
    } else {
      document.documentElement.dataset.themeSwitching = "";
      document
        .startViewTransition(() => applyTheme(themeSetting, resolvedTheme))
        .finished.then(() => {
          delete document.documentElement.dataset.themeSwitching;
        });
    }
  });
}
