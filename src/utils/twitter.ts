import type { DocsThemeConfig } from "../types";

export function deriveTwitterCreator(
  explicit: string | undefined,
  author: DocsThemeConfig["author"],
): string | null {
  if (explicit) return explicit;
  if (!author) return null;
  const match = author.url.match(/x\.com\/(@?[\w-]+)/);
  const raw = match?.[1];
  if (!raw) return null;
  return raw.startsWith("@") ? raw : `@${raw}`;
}
