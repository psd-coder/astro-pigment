import { describe, expect, it, vi } from "vitest";
import { markdownAssetUrl } from "./core";

vi.mock("@vercel/functions", () => ({
  next: () => new Response("<html>", { status: 200, headers: { "x-src": "next" } }),
}));

const { config, createVercelMiddleware } = await import("./vercel");

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

describe("vercel edge entry", () => {
  it("exposes a single matcher pattern", () => {
    expect(config.matcher).toHaveLength(1);
  });

  // The matcher only decides where the middleware runs; the core decides what it does. If they
  // disagree, a doc page silently stops negotiating (or an asset silently costs an invocation).
  it("matches exactly the paths the core negotiates", () => {
    const [pattern = ""] = config.matcher;
    const matcher = new RegExp(`^${pattern}$`);

    for (const pathname of SCOPING_PATHS) {
      const coreNegotiates = markdownAssetUrl(req(pathname, "text/markdown")) !== null;
      expect(matcher.test(pathname), pathname).toBe(coreNegotiates);
    }
  });

  it("serves markdown via the injected fetchAsset", async () => {
    const middleware = createVercelMiddleware({
      fetchAsset: async () => new Response("## md", { status: 200 }),
    });
    const res = await middleware(req("/guide", "text/markdown"));
    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(await res.text()).toBe("## md");
  });

  it("continues the chain via next() for html requests", async () => {
    const middleware = createVercelMiddleware();
    const res = await middleware(req("/guide", "text/html"));
    expect(res.headers.get("x-src")).toBe("next");
  });
});
