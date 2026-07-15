import { describe, expect, it } from "vitest";
import { prefersMarkdown } from "./accept";

describe("prefersMarkdown", () => {
  it("serves markdown when explicitly requested", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/x-markdown")).toBe(true);
  });

  it("serves markdown when preferred over html by quality", () => {
    expect(prefersMarkdown("text/markdown, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/html;q=0.9, text/markdown;q=0.9")).toBe(true);
  });

  it("respects a higher html preference", () => {
    expect(prefersMarkdown("text/html, text/markdown;q=0.8")).toBe(false);
    expect(prefersMarkdown("text/html;q=0.9, text/markdown;q=0.5")).toBe(false);
  });

  it("ignores browsers and wildcard clients", () => {
    expect(prefersMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown("application/json")).toBe(false);
  });

  it("treats zero-quality markdown and missing headers as no", () => {
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });

  it("is case-insensitive and tolerates whitespace", () => {
    expect(prefersMarkdown("TEXT/MARKDOWN")).toBe(true);
    expect(prefersMarkdown("  text/markdown ; q=1 ")).toBe(true);
  });
});
