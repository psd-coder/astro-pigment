import type { AstroGlobal } from "astro";
import type { AlternateLink } from "../types";

/** `origin` is expected without a trailing slash, as `Astro.site.origin` gives it. */
export function getAbsoluteUrl(origin: string, path: string): string {
  return origin + getHref(path);
}

// Anything carrying a scheme ("https://", "mailto:") or protocol-relative ("//")
// points outside the site. Internal hrefs are paths, absolute ("/api") or not.
const EXTERNAL_HREF = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

export function isExternalHref(href: string): boolean {
  return EXTERNAL_HREF.test(href);
}

/** External hrefs pass through verbatim; internal ones are resolved against `base`. */
export function getHref(href: string): string {
  if (isExternalHref(href)) return href;

  // Astro normalizes `base` to a trailing slash, which this concatenation relies on.
  const base = import.meta.env.BASE_URL;
  const normalized = href.startsWith("/") ? href.slice(1) : href;
  // "/base/index" → "/base/", "/base/foo/index" → "/base/foo/", others untouched.
  return (base + normalized).replace(/(^|\/)index$/, "$1");
}

// Docs route slug from a collection id: a trailing "/index" collapses to its
// parent (api/index → api) so section landings get clean URLs.
export function getRouteSlug(id: string): string | undefined {
  if (id === "index") return undefined;
  return id.endsWith("/index") ? id.slice(0, -"/index".length) : id;
}

export function getMarkdownAlternate(slug: string): AlternateLink {
  return {
    type: "text/markdown",
    title: "Markdown version",
    href: getHref(`${slug}.md`),
  };
}

// Trailing slashes are a build-format detail (a directory build serves "/api/"
// for a clean href "/api"), so paths are compared without them.
const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

/** Exact page match — for `aria-current="page"`. */
export function isCurrentHref(ctx: AstroGlobal, href: string): boolean {
  return normalizePath(getHref(href)) === normalizePath(ctx.url.pathname);
}

/** The page itself or any descendant of it — for section nav. */
export function isActiveHref(ctx: AstroGlobal, href: string): boolean {
  if (isCurrentHref(ctx, href)) return true;

  const target = normalizePath(getHref(href));
  // The root is every page's ancestor; only an exact match lights it up.
  if (target === normalizePath(import.meta.env.BASE_URL)) return false;

  return normalizePath(ctx.url.pathname).startsWith(`${target}/`);
}
