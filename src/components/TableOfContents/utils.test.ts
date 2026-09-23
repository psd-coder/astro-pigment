import { describe, expect, it } from "vitest";
import { getTocHeadings, type Heading } from "./utils";

const heading = (depth: number, slug: string): Heading => ({ depth, slug, text: slug });

describe("getTocHeadings", () => {
  it("keeps h2 and h3 in document order", () => {
    const headings = [heading(2, "a"), heading(3, "b"), heading(2, "c")];

    expect(getTocHeadings(headings)).toEqual(headings);
  });

  it("drops every other depth", () => {
    const headings = [
      heading(1, "title"),
      heading(2, "a"),
      heading(4, "deep"),
      heading(6, "deepest"),
    ];

    expect(getTocHeadings(headings)).toEqual([heading(2, "a")]);
  });

  it("returns nothing for a page without headings", () => {
    expect(getTocHeadings([])).toEqual([]);
  });

  it("returns nothing when no heading is an h2 or h3", () => {
    expect(getTocHeadings([heading(4, "deep")])).toEqual([]);
  });
});
