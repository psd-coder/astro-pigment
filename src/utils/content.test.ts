import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDocsCollection, getDocsStaticPaths } from "./content";

const { getCollectionMock } = vi.hoisted(() => ({ getCollectionMock: vi.fn() }));

vi.mock("astro:content", () => ({ getCollection: getCollectionMock }));

const docs = [
  { id: "api", collection: "docs", data: { title: "API", description: "", order: 2 } },
  { id: "index", collection: "docs", data: { title: "Home", description: "", order: 0 } },
  { id: "guide", collection: "docs", data: { title: "Guide", description: "", order: 1 } },
];

beforeEach(() => {
  getCollectionMock.mockReset();
  getCollectionMock.mockResolvedValue(docs);
});

describe("getDocsCollection", () => {
  it("returns docs sorted by order", async () => {
    const result = await getDocsCollection();
    expect(result.map((d) => d.id)).toEqual(["index", "guide", "api"]);
  });
});

describe("getDocsStaticPaths", () => {
  it("maps index to an undefined slug and other ids to themselves", async () => {
    const paths = await getDocsStaticPaths();
    expect(paths.map((p) => p.params.slug)).toEqual([undefined, "guide", "api"]);
  });

  it("wires prev/next with hrefs and omits them at the ends", async () => {
    const paths = await getDocsStaticPaths();
    expect(paths[0]?.props.prev).toBeUndefined();
    expect(paths[0]?.props.next).toEqual({ title: "Guide", href: "/guide" });
    expect(paths[1]?.props.prev).toEqual({ title: "Home", href: "/" });
    expect(paths[1]?.props.next).toEqual({ title: "API", href: "/api" });
    expect(paths[2]?.props.next).toBeUndefined();
  });
});
