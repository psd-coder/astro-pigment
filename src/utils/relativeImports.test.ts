import { describe, expect, it } from "vitest";
import { extractRelativeImports } from "./relativeImports";

describe("extractRelativeImports", () => {
  it("returns relative and absolute specifiers of static imports and re-exports", () => {
    const source = [
      'import Tabs from "./Tabs.astro";',
      'import "/src/styles/global.css";',
      'export { CodePanels } from "../CodePanels";',
      'export * from "./barrel";',
    ].join("\n");

    expect(extractRelativeImports(source)).toEqual([
      "./Tabs.astro",
      "/src/styles/global.css",
      "../CodePanels",
      "./barrel",
    ]);
  });

  it("skips bare specifiers", () => {
    expect(extractRelativeImports('import { atom } from "nanostores";')).toEqual([]);
  });

  it("skips type-only imports and re-exports", () => {
    const source = [
      'import type { Props } from "./types";',
      'export type { Props } from "./types";',
      'import { type Item, render } from "./render";',
    ].join("\n");

    expect(extractRelativeImports(source)).toEqual(["./render"]);
  });

  it("follows literal dynamic imports and skips computed ones", () => {
    const source = ['const a = import("./lazy");', "const b = import(name);"].join("\n");

    expect(extractRelativeImports(source)).toEqual(["./lazy"]);
  });

  it("ignores import-like text in comments and strings", () => {
    const source = ['// import "./commented";', "const s = \"import './quoted'\";"].join("\n");

    expect(extractRelativeImports(source)).toEqual([]);
  });

  it("returns an empty list for empty source", () => {
    expect(extractRelativeImports("")).toEqual([]);
  });

  it("returns an empty list when the lexer cannot parse the source", () => {
    expect(extractRelativeImports('import x from "./a\\u{ZZ}";')).toEqual([]);
  });
});
