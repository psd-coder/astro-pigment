import { describe, expect, it } from "vitest";
import { groupResults, type ScoredBlock } from "./group";
import type { BlockEntry } from "./types";

type BlockInit = Partial<BlockEntry> & { pageId: string; score: number };

function block({ score, ...overrides }: BlockInit): ScoredBlock {
  return {
    score,
    item: {
      pageTitle: overrides.pageId,
      pageOrder: 0,
      heading: "H",
      anchor: "h",
      body: "body text",
      ...overrides,
    },
  };
}

describe("groupResults", () => {
  it("ranks pages by their best block, not by page order", () => {
    const grouped = groupResults(
      [
        block({ pageId: "late", pageOrder: 9, score: 0.01 }),
        block({ pageId: "early", pageOrder: 1, score: 0.1 }),
      ],
      [],
    );
    expect(grouped.map((g) => g.pageId)).toEqual(["late", "early"]);
  });

  it("breaks ties on equal scores with page order", () => {
    const grouped = groupResults(
      [
        block({ pageId: "late", pageOrder: 9, score: 0.2 }),
        block({ pageId: "early", pageOrder: 1, score: 0.2 }),
      ],
      [],
    );
    expect(grouped.map((g) => g.pageId)).toEqual(["early", "late"]);
  });

  it("drops blocks trailing far behind the best hit", () => {
    const grouped = groupResults(
      [block({ pageId: "hit", score: 0.01 }), block({ pageId: "weak", score: 0.9 })],
      [],
    );
    expect(grouped.map((g) => g.pageId)).toEqual(["hit"]);
  });

  // A query built from corpus-common words scores every hit high, correct ones
  // included, so the tail must survive rather than collapse to "no results"
  it("keeps weak hits when the whole result set scores poorly", () => {
    const grouped = groupResults(
      [
        block({ pageId: "best", score: 0.76 }),
        block({ pageId: "near", score: 0.9 }),
        block({ pageId: "far", score: 0.99 }),
      ],
      [],
    );
    expect(grouped.map((g) => g.pageId)).toEqual(["best", "near", "far"]);
  });

  it("still trims the tail once the best hit is strong", () => {
    const grouped = groupResults(
      [
        block({ pageId: "best", score: 0.2 }),
        block({ pageId: "near", score: 0.5 }),
        block({ pageId: "far", score: 0.6 }),
      ],
      [],
    );
    expect(grouped.map((g) => g.pageId)).toEqual(["best", "near"]);
  });

  it("keeps only the best chunk of a section split across blocks", () => {
    const grouped = groupResults(
      [
        block({ pageId: "p", anchor: "ref", body: "first chunk", score: 0.1 }),
        block({ pageId: "p", anchor: "ref", body: "second chunk", score: 0.2 }),
        block({ pageId: "p", anchor: "other", body: "other", score: 0.3 }),
      ],
      [],
    );
    expect(grouped[0]?.blocks.map((b) => b.anchor)).toEqual(["ref", "other"]);
    expect(grouped[0]?.blocks[0]?.snippet).toBe("first chunk");
  });

  it("caps blocks per page and pages per result set", () => {
    const blocks = Array.from({ length: 12 }, (_, i) =>
      block({ pageId: `p${i % 10}`, anchor: `a${i}`, score: 0.01 * i }),
    );
    const grouped = groupResults(blocks, []);
    expect(grouped).toHaveLength(8);
    expect(Math.max(...grouped.map((g) => g.blocks.length))).toBeLessThanOrEqual(5);
  });

  it("returns nothing for no results", () => {
    expect(groupResults([], ["x"])).toEqual([]);
  });

  it("builds snippets around the query terms", () => {
    const body = `${"pad ".repeat(60)}needle here${" pad".repeat(60)}`;
    const grouped = groupResults([block({ pageId: "p", body, score: 0.1 })], ["needle"]);
    expect(grouped[0]?.blocks[0]?.snippet).toContain("needle");
  });
});
