import type { APIContext } from "astro";
import { describe, expect, it, vi } from "vitest";

const fx = vi.hoisted(() => ({
  siteConfig: { project: { name: "Pigment" } },
}));

vi.mock("virtual:pigment-config", () => ({ siteConfig: fx.siteConfig }));

const { GET } = await import("./site.webmanifest");

type Manifest = {
  name: string;
  short_name: string;
  icons: Array<{ src: string; sizes: string; type: string; purpose: string }>;
  theme_color: string;
  display: string;
};

describe("GET /site.webmanifest", () => {
  it("builds a manifest from the project name and icon hrefs", async () => {
    const res = await GET({} as APIContext);
    expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    const manifest = (await res.json()) as Manifest;

    expect(manifest.name).toBe("Pigment");
    expect(manifest.short_name).toBe("Pigment");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((i) => ({ src: i.src, sizes: i.sizes }))).toEqual([
      { src: "/web-app-manifest-192x192.png", sizes: "192x192" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512" },
    ]);
  });
});
