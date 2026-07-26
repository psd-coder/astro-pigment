import type { AstroGlobal } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAbsoluteUrl,
  getHref,
  getMarkdownAlternate,
  getRouteSlug,
  isActiveHref,
  isCurrentHref,
  isExternalHref,
} from "./urls";

function ctxWithPath(pathname: string): AstroGlobal {
  return { url: { pathname } } as unknown as AstroGlobal;
}

describe("getRouteSlug", () => {
  it("maps a section landing id to its parent route", () => {
    expect(getRouteSlug("api/index")).toBe("api");
  });

  it("maps the root index to an undefined slug", () => {
    expect(getRouteSlug("index")).toBeUndefined();
  });

  it("leaves an ordinary entry id untouched", () => {
    expect(getRouteSlug("api/debounced")).toBe("api/debounced");
  });

  it("collapses a nested section landing to its parent", () => {
    expect(getRouteSlug("api/hooks/index")).toBe("api/hooks");
  });

  it("collapses whole segments only", () => {
    expect(getRouteSlug("api/reindex")).toBe("api/reindex");
    expect(getRouteSlug("index/setup")).toBe("index/setup");
  });
});

describe("isExternalHref", () => {
  it("detects a scheme or a protocol-relative href", () => {
    expect(isExternalHref("https://astro.build")).toBe(true);
    expect(isExternalHref("HTTP://astro.build")).toBe(true);
    expect(isExternalHref("mailto:hi@example.com")).toBe(true);
    expect(isExternalHref("//astro.build")).toBe(true);
  });

  it("treats site paths as internal", () => {
    expect(isExternalHref("/api")).toBe(false);
    expect(isExternalHref("api")).toBe(false);
    expect(isExternalHref("")).toBe(false);
    // A colon deeper in the path is part of the segment, not a scheme.
    expect(isExternalHref("/api/foo:bar")).toBe(false);
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("with base '/'", () => {
  beforeEach(() => vi.stubEnv("BASE_URL", "/"));

  it("normalizes href leading slashes", () => {
    expect(getHref("/foo")).toBe("/foo");
    expect(getHref("foo")).toBe("/foo");
  });

  it("collapses a trailing index segment to its directory", () => {
    expect(getHref("/index")).toBe("/");
    expect(getHref("guide/index")).toBe("/guide/");
  });

  it("collapses whole index segments only", () => {
    expect(getHref("/index-signatures")).toBe("/index-signatures");
    expect(getHref("guide/indexing")).toBe("/guide/indexing");
    expect(getHref("/index/foo")).toBe("/index/foo");
  });

  it("resolves an empty href to the base", () => {
    expect(getHref("")).toBe("/");
  });

  it("leaves an external href untouched", () => {
    expect(getHref("https://astro.build/docs")).toBe("https://astro.build/docs");
    expect(getHref("mailto:hi@example.com")).toBe("mailto:hi@example.com");
  });

  it("never marks an external href active", () => {
    expect(isCurrentHref(ctxWithPath("/"), "https://astro.build")).toBe(false);
    expect(isActiveHref(ctxWithPath("/guide"), "https://astro.build")).toBe(false);
  });

  it("builds an absolute url from origin + href", () => {
    expect(getAbsoluteUrl("https://example.com", "/guide")).toBe("https://example.com/guide");
  });

  it("builds a markdown alternate link", () => {
    expect(getMarkdownAlternate("guide")).toEqual({
      type: "text/markdown",
      title: "Markdown version",
      href: "/guide.md",
    });
  });

  it("treats the root href as active only on the base path", () => {
    expect(isActiveHref(ctxWithPath("/"), "/")).toBe(true);
    expect(isActiveHref(ctxWithPath("/guide"), "/")).toBe(false);
  });

  it("marks a sub-path active on itself and its descendants", () => {
    expect(isActiveHref(ctxWithPath("/guide"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/guide/"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/guide/intro"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/guide/intro/setup"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/other"), "/guide")).toBe(false);
  });

  it("matches whole segments only", () => {
    expect(isActiveHref(ctxWithPath("/guidelines"), "/guide")).toBe(false);
  });

  it("matches the current page regardless of a trailing slash", () => {
    expect(isCurrentHref(ctxWithPath("/api/"), "/api")).toBe(true);
    expect(isCurrentHref(ctxWithPath("/api"), "/api")).toBe(true);
    expect(isCurrentHref(ctxWithPath("/"), "")).toBe(true);
  });

  it("does not treat a descendant as the current page", () => {
    expect(isCurrentHref(ctxWithPath("/api/debounced"), "/api")).toBe(false);
  });
});

describe("with base '/base/'", () => {
  beforeEach(() => vi.stubEnv("BASE_URL", "/base/"));

  it("prefixes hrefs with the base", () => {
    expect(getHref("/guide")).toBe("/base/guide");
    expect(getHref("/index")).toBe("/base/");
    expect(getHref("")).toBe("/base/");
  });

  it("collapses a nested trailing index segment to its directory", () => {
    expect(getHref("guide/index")).toBe("/base/guide/");
  });

  it("builds an absolute url through the base", () => {
    expect(getAbsoluteUrl("https://example.com", "/guide")).toBe("https://example.com/base/guide");
  });

  it("builds a markdown alternate link through the base", () => {
    expect(getMarkdownAlternate("guide")).toEqual({
      type: "text/markdown",
      title: "Markdown version",
      href: "/base/guide.md",
    });
  });

  it("marks the root active on both '/base/' and '/base'", () => {
    expect(isActiveHref(ctxWithPath("/base/"), "/")).toBe(true);
    expect(isActiveHref(ctxWithPath("/base"), "/")).toBe(true);
    expect(isActiveHref(ctxWithPath("/base/guide"), "/")).toBe(false);
  });

  it("marks a sub-path active when the current path starts with it", () => {
    expect(isActiveHref(ctxWithPath("/base/guide"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/base/guide/intro"), "/guide")).toBe(true);
    expect(isActiveHref(ctxWithPath("/base/other"), "/guide")).toBe(false);
  });

  it("matches whole segments only", () => {
    expect(isActiveHref(ctxWithPath("/base/guidelines"), "/guide")).toBe(false);
  });

  it("matches the current page under a base", () => {
    expect(isCurrentHref(ctxWithPath("/base/guide/"), "/guide")).toBe(true);
    expect(isCurrentHref(ctxWithPath("/base/"), "")).toBe(true);
    expect(isCurrentHref(ctxWithPath("/base"), "")).toBe(true);
    expect(isCurrentHref(ctxWithPath("/base/guide"), "")).toBe(false);
  });
});
