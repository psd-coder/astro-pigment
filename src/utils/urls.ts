import type { AstroGlobal } from "astro";
import type { AlternateLink } from "../types";

export function getAbsoluteUrl(origin: string, path: string): string {
  return origin + getHref(path);
}

export function getHref(href: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = href.startsWith("/") ? href.slice(1) : href;
  // "/base/index" → "/base/", "/base/foo/index" → "/base/foo/", others untouched.
  return (base + normalized).replace(/(^|\/)index$/, "$1");
}

export function getMarkdownAlternate(slug: string): AlternateLink {
  return {
    type: "text/markdown",
    title: "Markdown version",
    href: getHref(`${slug}.md`),
  };
}

export function isActiveHref(ctx: AstroGlobal, href: string): boolean {
  const currentPath = ctx.url.pathname;
  const base = import.meta.env.BASE_URL;
  const fullPath = getHref(href);

  if (fullPath === base || fullPath === base.replace(/\/$/, "")) {
    return currentPath === base || currentPath === base.replace(/\/$/, "");
  }

  return currentPath.startsWith(fullPath);
}
