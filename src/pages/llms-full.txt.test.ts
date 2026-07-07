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
  llmsFull?: boolean;
};

const fx = vi.hoisted(() => ({
  siteConfig: { project: { name: "Pigment", description: "A docs theme." } },
  docs: [
    {
      id: "guide",
      collection: "docs",
      data: { title: "Guide", description: "d", order: 1 },
      body: "## Setup\n\nInstall it.\n\n<Note>keep this</Note>",
    },
  ] as Doc[],
  extraEntries: [
    { id: "full-one", title: "Full One", description: "desc1", order: 3, body: "## Body one" },
    {
      id: "link-two",
      title: "Link Two",
      description: "desc2",
      order: 4,
      body: "## body two",
      llmsFull: false,
    },
    { id: "hidden", title: "Hidden", description: "no", order: 5, llms: false },
  ] as Extra[],
}));

vi.mock("virtual:pigment-config", () => ({ siteConfig: fx.siteConfig }));
vi.mock("virtual:pigment-extra-entries", () => ({ extraEntries: fx.extraEntries }));
vi.mock("astro:content", () => ({ getCollection: () => Promise.resolve(fx.docs) }));

const { GET } = await import("./llms-full.txt");

describe("GET /llms-full.txt", () => {
  it("inlines full doc bodies with MDX stripped", async () => {
    const res = await GET({} as APIContext);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();

    expect(body).toContain("# Pigment");
    expect(body).toContain("# Guide");
    expect(body).toContain("Install it.");
    expect(body).toContain("keep this");
    expect(body).not.toContain("<Note>");
  });

  it("inlines llmsFull entries but renders llmsFull:false entries as links only", async () => {
    const body = await (await GET({} as APIContext)).text();

    expect(body).toContain("# Full One");
    expect(body).toContain("desc1");
    expect(body).toContain("Body one");

    expect(body).toContain("- [Link Two](/link-two.md): desc2");
    expect(body).not.toContain("body two");
  });

  it("omits entries flagged llms: false entirely", async () => {
    const body = await (await GET({} as APIContext)).text();
    expect(body).not.toContain("Hidden");
  });
});
