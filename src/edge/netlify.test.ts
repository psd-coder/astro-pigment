import { describe, expect, it, vi } from "vitest";
import type { Context } from "@netlify/edge-functions";
import { markdownAssetUrl } from "./core";
import { config, createNetlifyMiddleware } from "./netlify";

// Doc pages, including versioned paths whose dot sits outside the last segment, then assets.
const SCOPING_PATHS = [
  "/",
  "/api",
  "/guide/getting-started",
  "/v1.2/guide",
  "/api/v2.0/reference",
  "/og.png",
  "/index.md",
  "/robots.txt",
  "/_astro/x.css",
  "/_astro/fonts/a.woff2",
  "/v1.2/guide.md",
];

function req(pathname: string, accept: string): Request {
  return new Request(`https://example.com${pathname}`, { headers: { accept } });
}

function context(): Context {
  return {
    next: async () => new Response("<html>", { status: 200, headers: { "x-src": "next" } }),
  } as unknown as Context;
}

describe("netlify edge entry", () => {
  it("runs on every route", () => {
    expect(config.path).toBe("/*");
  });

  // excludedPattern only decides where the middleware runs; the core decides what it does. If they
  // disagree, a doc page silently stops negotiating (or an asset silently costs an invocation).
  it("excludes exactly the paths the core does not negotiate", () => {
    const pattern = typeof config.excludedPattern === "string" ? config.excludedPattern : "";
    const excluded = new RegExp(pattern);

    for (const pathname of SCOPING_PATHS) {
      const coreNegotiates = markdownAssetUrl(req(pathname, "text/markdown")) !== null;
      expect(!excluded.test(pathname), pathname).toBe(coreNegotiates);
    }
  });

  it("serves markdown via the injected fetchAsset", async () => {
    const middleware = createNetlifyMiddleware({
      fetchAsset: async () => new Response("## md", { status: 200 }),
    });
    const res = await middleware(req("/guide", "text/markdown"), context());

    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("vary")).toBe("accept");
    expect(await res.text()).toBe("## md");
  });

  it("continues the chain via next() for html requests", async () => {
    const fetchAsset = vi.fn(async () => new Response("## md"));
    const middleware = createNetlifyMiddleware({ fetchAsset });
    const res = await middleware(req("/guide", "text/html"), context());

    expect(fetchAsset).not.toHaveBeenCalled();
    expect(res.headers.get("x-src")).toBe("next");
  });
});
