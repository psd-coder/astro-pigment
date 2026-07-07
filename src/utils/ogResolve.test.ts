import path from "node:path";
import { describe, expect, it } from "vitest";
import type { OgImageSource } from "../types";
import { isGenerated, resolveImageSource } from "./ogResolve";

const ROOT = "/project";

describe("resolveImageSource", () => {
  it("treats undefined as auto mode with the fallback logo and defaults", () => {
    expect(resolveImageSource(undefined, ROOT, "/logo.svg", "Title", "Desc")).toEqual({
      mode: "auto",
      templatePath: null,
      logoPath: "/logo.svg",
      title: "Title",
      description: "Desc",
    });
  });

  it("treats true the same as undefined", () => {
    expect(resolveImageSource(true, ROOT, null, "Title", "Desc")).toEqual(
      resolveImageSource(undefined, ROOT, null, "Title", "Desc"),
    );
  });

  it("resolves a string source to a file path relative to the astro root", () => {
    expect(resolveImageSource("og/card.png", ROOT, null, "Title", "Desc")).toEqual({
      mode: "file",
      filePath: path.resolve(ROOT, "og/card.png"),
    });
  });

  it("uses template mode when a template is provided", () => {
    const source = { template: "og/tpl.tsx", title: "Custom" } satisfies OgImageSource;
    expect(resolveImageSource(source, ROOT, "/logo.svg", "Title", "Desc")).toEqual({
      mode: "template",
      templatePath: path.resolve(ROOT, "og/tpl.tsx"),
      logoPath: "/logo.svg",
      title: "Custom",
      description: "Desc",
    });
  });

  it("disables the logo when logo is false", () => {
    const source = { logo: false } satisfies OgImageSource;
    expect(resolveImageSource(source, ROOT, "/fallback.svg", "Title", "Desc")).toMatchObject({
      mode: "auto",
      logoPath: null,
    });
  });

  it("resolves a string logo relative to the astro root", () => {
    const source = { logo: "brand/logo.svg" } satisfies OgImageSource;
    expect(resolveImageSource(source, ROOT, null, "Title", "Desc")).toMatchObject({
      logoPath: path.resolve(ROOT, "brand/logo.svg"),
    });
  });

  it("falls back to the fallback logo and defaults when the object omits them", () => {
    const source = { title: "Only Title" } satisfies OgImageSource;
    expect(resolveImageSource(source, ROOT, "/fallback.svg", "Title", "Desc")).toMatchObject({
      logoPath: "/fallback.svg",
      title: "Only Title",
      description: "Desc",
    });
  });
});

describe("isGenerated", () => {
  it("is true for auto and template modes", () => {
    expect(
      isGenerated({ mode: "auto", templatePath: null, logoPath: null, title: "", description: "" }),
    ).toBe(true);
    expect(
      isGenerated({
        mode: "template",
        templatePath: "/t",
        logoPath: null,
        title: "",
        description: "",
      }),
    ).toBe(true);
  });

  it("is false for file and none modes", () => {
    expect(isGenerated({ mode: "file", filePath: "/f.png" })).toBe(false);
    expect(isGenerated({ mode: "none" })).toBe(false);
  });
});
