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

// The endpoint captures the filtered extra entries at module load, so these
// fixtures are fixed for the whole file; tests vary only the requested slug.
const fx = vi.hoisted(() => ({
  docs: [
    {
      id: "guide",
      collection: "docs",
      data: { title: "Guide", description: "d", order: 1 },
      body: "## Setup\n\nHi <Note>x</Note>",
    },
  ] as Doc[],
  extraEntries: [
    {
      id: "examples/counter",
      title: "Counter",
      description: "cnt",
      order: 2,
      body: "## Demo\n\nrun",
    },
    { id: "secret", title: "Secret", description: "nope", order: 3, llms: false },
  ] as Extra[],
}));

vi.mock("virtual:pigment-extra-entries", () => ({ extraEntries: fx.extraEntries }));
vi.mock("astro:content", () => ({ getCollection: () => Promise.resolve(fx.docs) }));

const { GET, getStaticPaths } = await import("./[...slug].md");

function ctx(params: Record<string, string | undefined>): APIContext {
  return { params } as APIContext;
}

describe("GET /[...slug].md", () => {
  it("serves a doc body with MDX stripped", async () => {
    const res = await GET(ctx({ slug: "guide" }));
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();
    expect(body).toContain("## Setup");
    expect(body).toContain("Hi");
    expect(body).toContain("x");
    expect(body).not.toContain("<Note>");
  });

  it("serves an extra entry rendered as markdown", async () => {
    const body = await (await GET(ctx({ slug: "examples/counter" }))).text();
    expect(body).toContain("# Counter");
    expect(body).toContain("cnt");
    expect(body).toContain("Demo");
    expect(body).toContain("run");
  });

  it("returns 404 for an entry flagged llms: false", async () => {
    expect((await GET(ctx({ slug: "secret" }))).status).toBe(404);
  });

  it("returns 404 for an unknown slug", async () => {
    expect((await GET(ctx({ slug: "missing" }))).status).toBe(404);
  });
});

describe("getStaticPaths for /[...slug].md", () => {
  it("emits paths for docs and llms-enabled extra entries only", async () => {
    const paths = await getStaticPaths({} as Parameters<typeof getStaticPaths>[0]);
    expect(paths.map((p) => p.params.slug)).toEqual(["guide", "examples/counter"]);
  });
});
