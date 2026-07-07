import { describe, expect, it } from "vitest";
import type { FileEntry } from "./types";
import {
  buildHtml,
  getContentType,
  renderImportMap,
  renderMarkup,
  renderScripts,
  renderStyles,
} from "./utils";

const htmlFile: FileEntry = {
  name: "index.html",
  type: "html",
  lang: "html",
  content: "<h1>Hi</h1>",
};
const cssFile: FileEntry = {
  name: "styles.css",
  type: "css",
  lang: "css",
  content: "h1{color:red}",
};
const appJs: FileEntry = {
  name: "app.js",
  type: "javascript",
  lang: "javascript",
  content: "console.log(1)",
};
const moduleJs: FileEntry = {
  name: "util.js",
  type: "javascript",
  lang: "javascript",
  content: "export const x = 1",
};

describe("getContentType", () => {
  it("returns the content of entries matching the type", () => {
    expect(getContentType([htmlFile, cssFile, appJs], "css")).toEqual(["h1{color:red}"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(getContentType([htmlFile], "importmap")).toEqual([]);
  });
});

describe("renderImportMap", () => {
  it("merges multiple import map strings", () => {
    expect(renderImportMap(['{"imports":{"a":"/a"}}', '{"imports":{"b":"/b"}}'])).toBe(
      '<script type="importmap">{"imports":{"a":"/a","b":"/b"}}</script>',
    );
  });

  it("ignores malformed json", () => {
    expect(renderImportMap(["not json", '{"imports":{"a":"/a"}}'])).toContain('"a":"/a"');
  });

  it("applies overrides last", () => {
    expect(renderImportMap(['{"imports":{"a":"/a"}}'], { imports: { a: "/override" } })).toContain(
      '"a":"/override"',
    );
  });
});

describe("renderScripts / renderStyles / renderMarkup", () => {
  it("wraps scripts in a single module script tag", () => {
    expect(renderScripts(["a()", "b()"])).toBe('<script type="module">a()\nb()</script>');
  });

  it("wraps each style in its own style tag", () => {
    expect(renderStyles(["x{}", "y{}"])).toBe("<style>x{}</style>\n<style>y{}</style>");
  });

  it("joins markup fragments with newlines", () => {
    expect(renderMarkup(["<a></a>", "<b></b>"])).toBe("<a></a>\n<b></b>");
  });
});

describe("buildHtml", () => {
  it("embeds theme, styles, markup, and the main script", () => {
    const html = buildHtml([htmlFile, cssFile, appJs], undefined, "dark");
    expect(html).toContain("color-scheme: dark");
    expect(html).toContain("<style>h1{color:red}</style>");
    expect(html).toContain("<h1>Hi</h1>");
    expect(html).toContain("console.log(1)");
  });

  it("leaves color-scheme empty when no theme is given", () => {
    expect(buildHtml([appJs])).toContain('style="color-scheme: "');
  });

  it("turns non-main js modules into import-map data URIs keyed by name", () => {
    const html = buildHtml([appJs, moduleJs]);
    expect(html).toContain("data:text/javascript;charset=utf-8,");
    expect(html).toContain(encodeURIComponent("export const x = 1"));
    expect(html).toContain('"util.js"');
    expect(html).toContain("console.log(1)");
  });

  it("merges import map overrides with module imports", () => {
    const html = buildHtml([appJs, moduleJs], { imports: { lib: "/lib.js" } });
    expect(html).toContain('"lib":"/lib.js"');
    expect(html).toContain('"util.js"');
  });
});
