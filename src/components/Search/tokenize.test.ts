import { describe, expect, it } from "vitest";
import { findTermRanges, tokenizeQuery } from "./tokenize";

describe("tokenizeQuery", () => {
  it("splits on punctuation and lowercases", () => {
    expect(tokenizeQuery("Open-Graph, images!")).toEqual(["open", "graph", "images"]);
  });

  it("drops terms shorter than the minimum match length", () => {
    expect(tokenizeQuery("a og image")).toEqual(["og", "image"]);
  });

  it("dedupes repeated terms", () => {
    expect(tokenizeQuery("search Search")).toEqual(["search"]);
  });

  it("keeps non-latin words", () => {
    expect(tokenizeQuery("тема поиск")).toEqual(["тема", "поиск"]);
  });

  it("returns nothing for a query with no usable terms", () => {
    expect(tokenizeQuery("- / a")).toEqual([]);
  });
});

describe("findTermRanges", () => {
  it("finds every occurrence of every term", () => {
    expect(findTermRanges("view the view", ["view"])).toEqual([
      [0, 4],
      [9, 13],
    ]);
  });

  it("returns ranges sorted by position across terms", () => {
    expect(findTermRanges("image of og", ["og", "image"])).toEqual([
      [0, 5],
      [9, 11],
    ]);
  });

  it("merges overlapping matches from different terms", () => {
    expect(findTermRanges("transitions", ["transition", "sit"])).toEqual([[0, 10]]);
  });

  it("matches case-insensitively while reporting source offsets", () => {
    expect(findTermRanges("ViewTransitions", ["transitions"])).toEqual([[4, 15]]);
  });

  it("returns nothing without terms or text", () => {
    expect(findTermRanges("body", [])).toEqual([]);
    expect(findTermRanges("", ["body"])).toEqual([]);
  });
});
