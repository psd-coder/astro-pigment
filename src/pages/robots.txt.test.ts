import type { APIContext } from "astro";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./robots.txt";

function ctx(site?: URL): APIContext {
  return { site } as APIContext;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /robots.txt", () => {
  it("emits an absolute sitemap url when a site is configured", async () => {
    const res = await GET(ctx(new URL("https://example.com/")));
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    const body = await res.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap: https://example.com/sitemap-index.xml");
  });

  it("falls back to a root-relative sitemap path with no site", async () => {
    const body = await (await GET(ctx())).text();
    expect(body).toContain("Sitemap: /sitemap-index.xml");
  });

  it("prefixes the sitemap with the configured base", async () => {
    vi.stubEnv("BASE_URL", "/base/");
    const body = await (await GET(ctx(new URL("https://example.com/")))).text();
    expect(body).toContain("Sitemap: https://example.com/base/sitemap-index.xml");
  });
});
