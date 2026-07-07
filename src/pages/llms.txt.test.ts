import type { APIContext } from "astro";
import { describe, expect, it, vi } from "vitest";

type Doc = {
  id: string;
  collection: "docs";
  data: { title: string; description: string; order: number };
  body?: string;
};

type Extra = {
  id: string;
  title: string;
  description: string;
  order: number;
  body?: string;
  llms?: boolean;
};

const fx = vi.hoisted(() => ({
  siteConfig: { project: { name: "Pigment", description: "A docs theme." } },
  docs: [
    {
      id: "guide",
      collection: "docs",
      data: { title: "Guide", description: "Start here", order: 1 },
      body: "## Setup\n\n### install\n\n## Usage",
    },
  ] as Doc[],
  extraEntries: [
    {
      id: "examples/counter",
      title: "Counter",
      description: "A counter",
      order: 3,
      body: "## Demo",
    },
    { id: "changelog", title: "Changelog", description: "Changes", order: 4, llms: false },
  ] as Extra[],
}));

vi.mock("virtual:pigment-config", () => ({ siteConfig: fx.siteConfig }));
vi.mock("virtual:pigment-extra-entries", () => ({ extraEntries: fx.extraEntries }));
vi.mock("astro:content", () => ({ getCollection: () => Promise.resolve(fx.docs) }));

const { GET } = await import("./llms.txt");

describe("GET /llms.txt", () => {
  it("renders a markdown index from config, docs, and extra entries", async () => {
    const res = await GET({} as APIContext);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();

    expect(body).toContain("# Pigment");
    expect(body).toContain("A docs theme.");
    expect(body).toContain(
      "- [llms-full.txt](/llms-full.txt): Complete documentation in a single file",
    );
    expect(body).toContain("## Guide");
    expect(body).toContain("- [Guide](/guide.md): Start here");
    expect(body).toContain("  - Setup: install");
    expect(body).toContain("  - Usage");
    expect(body).toContain("## Counter");
    expect(body).toContain("- [Counter](/examples/counter.md): A counter");
  });

  it("omits extra entries flagged llms: false", async () => {
    const body = await (await GET({} as APIContext)).text();
    expect(body).not.toContain("Changelog");
  });
});
