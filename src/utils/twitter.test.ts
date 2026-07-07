import { describe, expect, it } from "vitest";
import type { DocsThemeConfig } from "../types";
import { deriveTwitterCreator } from "./twitter";

type Author = DocsThemeConfig["author"];

describe("deriveTwitterCreator", () => {
  it("returns the explicit handle unchanged", () => {
    const author = { name: "Pavel", url: "https://x.com/psdcoder" } satisfies Author;
    expect(deriveTwitterCreator("@custom", author)).toBe("@custom");
  });

  it("returns null when there is neither an explicit handle nor an author", () => {
    expect(deriveTwitterCreator(undefined, undefined)).toBeNull();
  });

  it("derives an @-prefixed handle from an x.com author url", () => {
    const author = { name: "Pavel", url: "https://x.com/psdcoder" } satisfies Author;
    expect(deriveTwitterCreator(undefined, author)).toBe("@psdcoder");
  });

  it("keeps an existing @ in the url handle", () => {
    const author = { name: "Pavel", url: "https://x.com/@psdcoder" } satisfies Author;
    expect(deriveTwitterCreator(undefined, author)).toBe("@psdcoder");
  });

  it("extracts the handle from a deeper x.com path", () => {
    const author = { name: "Pavel", url: "https://x.com/psdcoder/status/123" } satisfies Author;
    expect(deriveTwitterCreator(undefined, author)).toBe("@psdcoder");
  });

  it("returns null for a non-x.com author url", () => {
    const author = { name: "Pavel", url: "https://github.com/psd-coder" } satisfies Author;
    expect(deriveTwitterCreator(undefined, author)).toBeNull();
  });
});
