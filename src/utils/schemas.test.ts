import { describe, expect, it } from "vitest";
import { docEntryDataSchema, docEntrySchema, menuSchema } from "./schemas";

describe("docEntryDataSchema", () => {
  it("accepts a well-formed data object", () => {
    expect(docEntryDataSchema.safeParse({ title: "T", description: "D", order: 1 }).success).toBe(
      true,
    );
  });

  it("rejects a non-numeric order", () => {
    expect(docEntryDataSchema.safeParse({ title: "T", description: "D", order: "1" }).success).toBe(
      false,
    );
  });

  it("rejects a missing field", () => {
    expect(docEntryDataSchema.safeParse({ title: "T", order: 1 }).success).toBe(false);
  });

  it("leaves menu unset and defaults toc to true when omitted", () => {
    const result = docEntryDataSchema.parse({ title: "T", description: "D", order: 1 });
    expect(result.menu).toBeUndefined();
    expect(result.toc).toBe(true);
  });

  it("accepts a menu id and toc false", () => {
    const base = { title: "T", description: "D", order: 1 };
    expect(docEntryDataSchema.parse({ ...base, menu: "api" }).menu).toBe("api");
    expect(docEntryDataSchema.parse({ ...base, toc: false }).toc).toBe(false);
  });

  it("rejects a non-string menu", () => {
    expect(
      docEntryDataSchema.safeParse({ title: "T", description: "D", order: 1, menu: 1 }).success,
    ).toBe(false);
  });
});

describe("docEntrySchema", () => {
  const valid = {
    id: "guide",
    collection: "docs",
    data: { title: "Guide", description: "A guide", order: 2 },
  };

  it("parses a valid entry and preserves unknown keys (loose object)", () => {
    const result = docEntrySchema.parse({ ...valid, rendered: { html: "<p></p>" } });
    expect(result.id).toBe("guide");
    expect(result).toHaveProperty("rendered");
  });

  it("rejects a collection other than 'docs'", () => {
    expect(docEntrySchema.safeParse({ ...valid, collection: "blog" }).success).toBe(false);
  });

  it("accepts optional filePath and body", () => {
    expect(docEntrySchema.safeParse({ ...valid, filePath: "x.md", body: "hi" }).success).toBe(true);
  });
});

describe("menuSchema", () => {
  it("parses a well-formed grouped menu", () => {
    const result = menuSchema.parse({
      groups: [{ label: "Core", items: [{ title: "debounce", href: "/api/debounce" }] }],
    });
    expect(result.groups[0]?.label).toBe("Core");
    expect(result.groups[0]?.items[0]).toEqual({ title: "debounce", href: "/api/debounce" });
  });

  it("accepts an ungrouped group (label null)", () => {
    const result = menuSchema.safeParse({
      groups: [{ label: null, items: [{ title: "Home", href: "/" }] }],
    });
    expect(result.success).toBe(true);
    expect(result.data?.groups[0]?.label).toBeNull();
  });

  it("accepts attrs on items and group links", () => {
    const result = menuSchema.safeParse({
      groups: [
        {
          label: "Astro",
          href: "https://astro.build",
          attrs: { target: "_blank", "data-order": 1, hidden: true },
          items: [{ title: "GitHub", href: "https://gh.com", attrs: { rel: "noopener" } }],
        },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data?.groups[0]?.attrs).toEqual({
      target: "_blank",
      "data-order": 1,
      hidden: true,
    });
    expect(result.data?.groups[0]?.items[0]?.attrs).toEqual({ rel: "noopener" });
  });

  it("rejects attrs with a non-primitive value", () => {
    const result = menuSchema.safeParse({
      groups: [{ label: null, items: [{ title: "T", href: "/t", attrs: { target: {} } }] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an item missing an href", () => {
    const result = menuSchema.safeParse({
      groups: [{ label: null, items: [{ title: "Broken" }] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a group missing the label key", () => {
    const result = menuSchema.safeParse({ groups: [{ items: [] }] });
    expect(result.success).toBe(false);
  });

  it("accepts a group that is itself a link, defaulting items to empty", () => {
    const result = menuSchema.safeParse({ groups: [{ label: "Overview", href: "/api" }] });
    expect(result.success).toBe(true);
    expect(result.data?.groups[0]?.href).toBe("/api");
    expect(result.data?.groups[0]?.items).toEqual([]);
  });

  it("accepts a group link pointing outside the site", () => {
    const result = menuSchema.safeParse({
      groups: [{ label: "Astro", href: "https://astro.build" }],
    });
    expect(result.success).toBe(true);
    expect(result.data?.groups[0]?.href).toBe("https://astro.build");
  });
});
