import type { AstroGlobal } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAbsoluteUrl, getHref, getMarkdownAlternate, isActiveHref } from "./urls";

function ctxWithPath(pathname: string): AstroGlobal {
  return { url: { pathname } } as unknown as AstroGlobal;
}

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
});

describe("with base '/base/'", () => {
  beforeEach(() => vi.stubEnv("BASE_URL", "/base/"));

  it("prefixes hrefs with the base", () => {
    expect(getHref("/guide")).toBe("/base/guide");
    expect(getHref("/index")).toBe("/base/");
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
});
