import { describe, expect, it } from "vitest";
import { docEntryDataSchema, docEntrySchema } from "./schemas";

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
