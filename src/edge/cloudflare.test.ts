import { describe, expect, it, vi } from "vitest";
import { createCloudflareMiddleware } from "./cloudflare";

function context(pathname: string, accept: string, assetFetch: (url: URL) => Promise<Response>) {
  return {
    request: new Request(`https://example.com${pathname}`, { headers: { accept } }),
    next: async () => new Response("<html>", { status: 200, headers: { "x-src": "next" } }),
    env: { ASSETS: { fetch: assetFetch } },
  };
}

describe("cloudflare pages entry", () => {
  it("serves the .md asset from the ASSETS binding", async () => {
    const assetFetch = vi.fn(async (_url: URL) => new Response("## md", { status: 200 }));
    const onRequest = createCloudflareMiddleware();
    const res = await onRequest(context("/guide", "text/markdown", assetFetch));

    expect(assetFetch.mock.calls[0]?.[0]?.pathname).toBe("/guide.md");
    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("vary")).toBe("accept");
    expect(await res.text()).toBe("## md");
  });

  it("falls through to next() for html requests", async () => {
    const assetFetch = vi.fn(async () => new Response("## md"));
    const onRequest = createCloudflareMiddleware();
    const res = await onRequest(context("/guide", "text/html", assetFetch));

    expect(assetFetch).not.toHaveBeenCalled();
    expect(res.headers.get("x-src")).toBe("next");
  });
});
