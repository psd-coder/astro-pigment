import { describe, expect, it } from "vitest";
import { extractSnippet } from "./snippet";

const filler = (word: string, count: number) => Array.from({ length: count }, () => word).join(" ");

describe("extractSnippet", () => {
  it("returns an empty string for an empty body", () => {
    expect(extractSnippet("", ["search"])).toBe("");
  });

  it("returns the whole body when it is shorter than the window", () => {
    expect(extractSnippet("Full-text search is enabled.", ["search"])).toBe(
      "Full-text search is enabled.",
    );
  });

  it("falls back to the head of the body when no term matches", () => {
    const body = filler("word", 100);
    const snippet = extractSnippet(body, ["absent"]);
    expect(snippet.startsWith("word word")).toBe(true);
    expect(snippet.endsWith("...")).toBe(true);
  });

  it("centres the window on a match deep in the body", () => {
    const body = `${filler("pad", 100)} needle ${filler("pad", 100)}`;
    const snippet = extractSnippet(body, ["needle"]);
    expect(snippet).toContain("needle");
    expect(snippet.startsWith("...")).toBe(true);
    expect(snippet.endsWith("...")).toBe(true);
  });

  it("prefers the passage covering the most distinct terms", () => {
    const body = [
      "alpha alone here",
      filler("pad", 60),
      "alpha and beta together",
      filler("pad", 60),
      "beta alone here",
    ].join(" ");
    expect(extractSnippet(body, ["alpha", "beta"])).toContain("alpha and beta together");
  });

  it("cuts at word boundaries rather than mid-word", () => {
    const body = `${filler("pad", 100)} needle ${filler("pad", 100)}`;
    const snippet = extractSnippet(body, ["needle"]).replaceAll("...", "");
    expect(snippet.split(" ").every((word) => word === "pad" || word === "needle")).toBe(true);
  });

  it("keeps the leading ellipsis off a match near the start", () => {
    const body = `needle ${filler("pad", 100)}`;
    expect(extractSnippet(body, ["needle"]).startsWith("needle")).toBe(true);
  });
});
