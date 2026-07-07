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
  search?: boolean;
};

type Block = { pageId: string; pageTitle: string; heading: string; anchor: string; body: string };

const fx = vi.hoisted(() => ({
  docs: [
    {
      id: "guide",
      collection: "docs",
      data: { title: "Guide", description: "d", order: 1 },
      body: "Intro para.\n\n## Setup\n\nAlpha.\n\n## Setup\n\nBeta.",
    },
  ] as Doc[],
  extraEntries: [
    { id: "ex", title: "Ex", description: "exdesc", order: 2, body: "## Feature\n\nFast." },
    { id: "noindex", title: "NoIndex", description: "skip", order: 3, search: false },
    { id: "bodyless", title: "Bodyless", description: "just desc", order: 4 },
  ] as Extra[],
}));

vi.mock("virtual:pigment-extra-entries", () => ({ extraEntries: fx.extraEntries }));
vi.mock("astro:content", () => ({ getCollection: () => Promise.resolve(fx.docs) }));

const { GET } = await import("./search-index.json");

async function getIndex(): Promise<Block[]> {
  const res = await GET({} as APIContext);
  expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
  return (await res.json()) as Block[];
}

describe("GET /search-index.json", () => {
  it("backfills the leading section heading with the page title and dedupes slugs", async () => {
    const index = await getIndex();
    const guide = index.filter((e) => e.pageId === "guide");
    expect(guide.map((e) => e.heading)).toEqual(["Guide", "Setup", "Setup"]);
    expect(guide.map((e) => e.anchor)).toEqual(["guide", "setup", "setup-1"]);
    expect(guide[0]?.body).toBe("Intro para.");
  });

  it("splits extra entries that have a body into sections", async () => {
    const index = await getIndex();
    const ex = index.filter((e) => e.pageId === "ex");
    expect(ex).toHaveLength(1);
    expect(ex[0]).toMatchObject({ heading: "Feature", anchor: "feature", body: "Fast." });
  });

  it("falls back to the description for body-less entries", async () => {
    const index = await getIndex();
    const bodyless = index.find((e) => e.pageId === "bodyless");
    expect(bodyless).toMatchObject({ heading: "", anchor: "", body: "just desc" });
  });

  it("excludes entries flagged search: false", async () => {
    const index = await getIndex();
    expect(index.some((e) => e.pageId === "noindex")).toBe(false);
  });
});
