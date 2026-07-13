import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";
import { gfmMarkdownConfig } from "./markdownConfig";

const GFM_FIXTURE = [
  "| a | b |",
  "| - | - |",
  "| 1 | 2 |",
  "",
  "~~struck~~",
  "",
  "- [ ] todo",
  "- [x] done",
  "",
].join("\n");

// Parse through the exact remark-gfm the config wires in (asserted by reference below).
function parseGfm(md: string) {
  return unified().use(remarkParse).use(remarkGfm).parse(md);
}

describe("gfmMarkdownConfig", () => {
  it("wires remark-gfm and disables Astro's built-in copy to avoid double-processing", () => {
    expect(gfmMarkdownConfig.remarkPlugins).toHaveLength(1);
    expect(gfmMarkdownConfig.remarkPlugins).toContain(remarkGfm);
    expect(gfmMarkdownConfig.gfm).toBe(false);
  });

  it("keeps smartypants typography on (any object enables it)", () => {
    expect(gfmMarkdownConfig.smartypants).not.toBe(false);
    expect(typeof gfmMarkdownConfig.smartypants).toBe("object");
  });

  it("parses GFM tables", () => {
    let hasTable = false;
    visit(parseGfm(GFM_FIXTURE), "table", () => {
      hasTable = true;
    });
    expect(hasTable).toBe(true);
  });

  it("parses GFM strikethrough", () => {
    let hasDelete = false;
    visit(parseGfm(GFM_FIXTURE), "delete", () => {
      hasDelete = true;
    });
    expect(hasDelete).toBe(true);
  });

  it("parses GFM task list items with a checked state", () => {
    const checkedStates: boolean[] = [];
    visit(parseGfm(GFM_FIXTURE), "listItem", (node) => {
      if (typeof node.checked === "boolean") checkedStates.push(node.checked);
    });
    expect(checkedStates).toEqual([false, true]);
  });
});
