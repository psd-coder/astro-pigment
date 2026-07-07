import { parseHTML } from "linkedom";
import { describe, expect, it, vi } from "vitest";
import { dedent, parseExampleHtml, resolveType } from "./examples";

// examples.ts imports `defineCollection` from the astro:content virtual module
// at load time; stub it so the module resolves under Vitest.
vi.mock("astro:content", () => ({ defineCollection: vi.fn() }));

describe("dedent", () => {
  it("removes the common leading indentation", () => {
    expect(dedent("    a\n    b")).toBe("a\nb");
  });

  it("uses the minimum indent across non-blank lines", () => {
    expect(dedent("  a\n      b")).toBe("a\n    b");
  });

  it("leaves unindented text untouched", () => {
    expect(dedent("a\nb")).toBe("a\nb");
  });

  it("returns empty text unchanged", () => {
    expect(dedent("")).toBe("");
  });
});

describe("resolveType", () => {
  function firstEl(html: string, selector: string): Element {
    const { document } = parseHTML(`<body>${html}</body>`);
    const el = document.querySelector(selector);
    if (!el) throw new Error(`no element matched ${selector}`);
    return el;
  }

  it("reads an explicit data-type", () => {
    expect(resolveType(firstEl('<div data-type="css"></div>', "div"))).toBe("css");
  });

  it("recognizes an importmap script by its type attribute", () => {
    expect(resolveType(firstEl('<script type="importmap"></script>', "script"))).toBe("importmap");
  });

  it("returns null for an unmarked element", () => {
    expect(resolveType(firstEl("<div></div>", "div"))).toBeNull();
  });
});

describe("parseExampleHtml", () => {
  const raw = [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    "<title>Counter</title>",
    '<meta name="description" content="A counter demo">',
    '<script type="importmap">{"imports":{"x":"/x"}}</script>',
    "</head>",
    "<body>",
    '<div id="description">Some <b>desc</b></div>',
    '<div data-type="html"><button>Click</button></div>',
    '<script data-type="javascript">console.log("hi");</script>',
    '<style data-type="css">body{color:red}</style>',
    "</body>",
    "</html>",
  ].join("\n");

  it("extracts title, description, descriptionHtml, and the raw body", () => {
    const parsed = parseExampleHtml(raw);
    expect(parsed.title).toBe("Counter");
    expect(parsed.description).toBe("A counter demo");
    expect(parsed.descriptionHtml).toBe("Some <b>desc</b>");
    expect(parsed.body).toBe(raw);
  });

  it("orders files html, javascript, css, importmap", () => {
    expect(parseExampleHtml(raw).files.map((f) => f.type)).toEqual([
      "html",
      "javascript",
      "css",
      "importmap",
    ]);
  });

  it("applies default names and dedented, trimmed content per type", () => {
    const byType = Object.fromEntries(parseExampleHtml(raw).files.map((f) => [f.type, f]));
    expect(byType.html).toMatchObject({ name: "index.html", content: "<button>Click</button>" });
    expect(byType.javascript).toMatchObject({ name: "app.js", content: 'console.log("hi");' });
    expect(byType.css).toMatchObject({ name: "styles.css", content: "body{color:red}" });
    expect(byType.importmap).toMatchObject({
      name: "importmap.json",
      content: '{"imports":{"x":"/x"}}',
    });
  });

  it("skips a second file that reuses an existing name", () => {
    const dup = '<div data-type="css">a{}</div><div data-type="css">b{}</div>';
    const { files } = parseExampleHtml(`<html><body>${dup}</body></html>`);
    expect(files).toHaveLength(1);
    expect(files[0]?.content).toBe("a{}");
  });

  it("falls back to description for descriptionHtml when no #description element exists", () => {
    const html =
      '<html><head><meta name="description" content="Fallback"></head><body></body></html>';
    expect(parseExampleHtml(html).descriptionHtml).toBe("Fallback");
  });
});
