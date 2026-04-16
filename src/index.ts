import type { DocsThemeConfig } from "./types";
import { createIntegration } from "./integration";

export default function docsTheme(config: DocsThemeConfig) {
  return createIntegration(config);
}

export { adaptiveCodeTheme } from "./themes/adaptive-code-theme";
export const shikiThemes = {
  light: "catppuccin-latte",
  dark: "catppuccin-mocha",
} as const;

export { fonts } from "./utils/fonts";
export type {
  DocsThemeConfig,
  SiteConfig,
  NavItem,
  IconName,
  FileEntry,
  ExtraEntry,
} from "./types";
