import { describe, expect, it, vi } from "vitest";
import { markdownAssetUrl, negotiateMarkdown } from "./core";

function req(pathname: string, init?: { accept?: string | null; method?: string }): Request {
  const headers = new Headers();
  const accept = init?.accept === undefined ? "text/markdown" : init.accept;
  if (accept !== null) headers.set("accept", accept);
  return new Request(`https://example.com${pathname}`, { method: init?.method ?? "GET", headers });
}

describe("markdownAssetUrl", () => {
  it("maps doc paths to their .md asset", () => {
    expect(markdownAssetUrl(req("/guide"))?.pathname).toBe("/guide.md");
    expect(markdownAssetUrl(req("/guide/intro"))?.pathname).toBe("/guide/intro.md");
    expect(markdownAssetUrl(req("/guide/"))?.pathname).toBe("/guide.md");
    expect(markdownAssetUrl(req("/"))?.pathname).toBe("/index.md");
  });

  it("honors a configured base", () => {
    expect(markdownAssetUrl(req("/docs/guide"), { base: "/docs/" })?.pathname).toBe(
      "/docs/guide.md",
    );
    expect(markdownAssetUrl(req("/docs/"), { base: "/docs/" })?.pathname).toBe("/docs/index.md");
    expect(markdownAssetUrl(req("/docs"), { base: "/docs/" })?.pathname).toBe("/docs/index.md");
  });

  it("drops the query string", () => {
    expect(markdownAssetUrl(req("/guide?x=1"))?.href).toBe("https://example.com/guide.md");
  });

  it("skips file paths (loop-safe)", () => {
    expect(markdownAssetUrl(req("/guide.md"))).toBeNull();
    expect(markdownAssetUrl(req("/_astro/app.css"))).toBeNull();
    expect(markdownAssetUrl(req("/og.png"))).toBeNull();
  });

  it("skips non-GET and non-markdown requests", () => {
    expect(markdownAssetUrl(req("/guide", { method: "POST" }))).toBeNull();
    expect(markdownAssetUrl(req("/guide", { accept: "text/html" }))).toBeNull();
    expect(markdownAssetUrl(req("/guide", { accept: null }))).toBeNull();
  });
});

describe("negotiateMarkdown", () => {
  const passthrough = () => new Response("<html>", { status: 200, headers: { "x-src": "html" } });

  it("serves the fetched markdown with corrected headers", async () => {
    const fetchAsset = vi.fn(async (_url: URL) => new Response("## Setup", { status: 200 }));
    const res = await negotiateMarkdown(req("/guide"), passthrough, { fetchAsset });

    expect(fetchAsset).toHaveBeenCalledOnce();
    expect(fetchAsset.mock.calls[0]?.[0]?.pathname).toBe("/guide.md");
    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("vary")).toBe("accept");
    expect(await res.text()).toBe("## Setup");
  });

  it("falls back to passthrough when the .md asset is missing", async () => {
    const fetchAsset = vi.fn(async () => new Response("not found", { status: 404 }));
    const res = await negotiateMarkdown(req("/not-a-doc"), passthrough, { fetchAsset });
    expect(res.headers.get("x-src")).toBe("html");
    expect(await res.text()).toBe("<html>");
  });

  it("passes through without fetching when markdown is not preferred", async () => {
    const fetchAsset = vi.fn(async () => new Response("## Setup"));
    const res = await negotiateMarkdown(req("/guide", { accept: "text/html" }), passthrough, {
      fetchAsset,
    });
    expect(fetchAsset).not.toHaveBeenCalled();
    expect(res.headers.get("x-src")).toBe("html");
  });
});
