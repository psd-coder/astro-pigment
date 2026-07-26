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
  getCollectionMock.mockImplementation(async (collection: string) =>
    collection === "menu" ? [] : docs,
  );
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

  it("maps a section-landing id to its parent slug", async () => {
    getCollectionMock.mockResolvedValue([
      { id: "index", collection: "docs", data: { title: "Home", description: "", order: 0 } },
      { id: "api/index", collection: "docs", data: { title: "API", description: "", order: 1 } },
      {
        id: "api/debounced",
        collection: "docs",
        data: { title: "debounced", description: "", order: 2 },
      },
    ]);
    const paths = await getDocsStaticPaths();
    expect(paths.map((p) => p.params.slug)).toEqual([undefined, "api", "api/debounced"]);
  });
});

describe("getDocsStaticPaths menu-reference validation", () => {
  function withMenus(menuIds: string[], menu: string) {
    getCollectionMock.mockImplementation(async (collection: string) =>
      collection === "menu"
        ? menuIds.map((id) => ({ id, collection: "menu", data: { groups: [] } }))
        : [
            {
              id: "guide",
              collection: "docs",
              data: { title: "Guide", description: "", order: 0, menu },
            },
          ],
    );
  }

  it("fails the build naming the page and the missing menu id", async () => {
    withMenus(["api"], "missing");
    await expect(getDocsStaticPaths()).rejects.toThrow(/guide[\s\S]*missing/);
  });

  it("accepts a menu that resolves to an existing entry", async () => {
    withMenus(["api"], "api");
    const paths = await getDocsStaticPaths();
    expect(paths.map((p) => p.params.slug)).toEqual(["guide"]);
  });
});

describe("getDocsStaticPaths route-collision validation", () => {
  it("fails the build when two ids resolve to the same route slug", async () => {
    getCollectionMock.mockImplementation(async (collection: string) =>
      collection === "menu"
        ? []
        : [
            { id: "api", collection: "docs", data: { title: "API", description: "", order: 0 } },
            {
              id: "api/index",
              collection: "docs",
              data: { title: "API landing", description: "", order: 1 },
            },
          ],
    );
    await expect(getDocsStaticPaths()).rejects.toThrow(/route slug "api"[\s\S]*api\/index/);
  });

  it("does not flag distinct routes, including the root index", async () => {
    getCollectionMock.mockImplementation(async (collection: string) =>
      collection === "menu"
        ? []
        : [
            { id: "index", collection: "docs", data: { title: "Home", description: "", order: 0 } },
            {
              id: "api/index",
              collection: "docs",
              data: { title: "API", description: "", order: 1 },
            },
            {
              id: "api/debounced",
              collection: "docs",
              data: { title: "debounced", description: "", order: 2 },
            },
          ],
    );
    const paths = await getDocsStaticPaths();
    expect(paths.map((p) => p.params.slug)).toEqual([undefined, "api", "api/debounced"]);
  });
});
