import { describe, expect, it } from "vitest";
import {
  extractSections,
  formatSections,
  markdownLinkItem,
  renderExtraEntryMarkdown,
  splitMarkdownIntoSections,
  stringifyCleanMarkdown,
} from "./markdown";

describe("markdownLinkItem", () => {
  it("formats a titled link with a description", () => {
    expect(markdownLinkItem("Guide", "/guide", "Getting started")).toBe(
      "- [Guide](/guide): Getting started",
    );
  });
});

describe("renderExtraEntryMarkdown", () => {
  it("renders title and description without a body", () => {
    expect(renderExtraEntryMarkdown({ title: "T", description: "D" })).toBe("# T\n\nD");
  });

  it("appends a cleaned body when present", () => {
    const out = renderExtraEntryMarkdown({ title: "T", description: "D", body: "## Sub\n\nHi" });
    expect(out.startsWith("# T\n\nD\n\n")).toBe(true);
    expect(out).toContain("## Sub");
    expect(out).toContain("Hi");
  });
});

describe("stringifyCleanMarkdown", () => {
  it("drops MDX import statements", () => {
    const out = stringifyCleanMarkdown('import Foo from "./Foo";\n\n# Title\n\nBody');
    expect(out).not.toContain("import Foo");
    expect(out).toContain("# Title");
    expect(out).toContain("Body");
  });

  it("unwraps JSX elements but keeps their text", () => {
    const out = stringifyCleanMarkdown("<Note>Keep this</Note>");
    expect(out).not.toContain("<Note>");
    expect(out).toContain("Keep this");
  });

  it("strips YAML frontmatter", () => {
    const out = stringifyCleanMarkdown("---\ntitle: Secret\n---\n\n# Heading");
    expect(out).not.toContain("title: Secret");
    expect(out).toContain("# Heading");
  });

  it("collapses <InstallPackage> to a single pnpm command", () => {
    const out = stringifyCleanMarkdown('<InstallPackage pkg="astro-pigment nanostores" />');
    expect(out).toContain("```sh");
    expect(out).toContain("pnpm add astro-pigment nanostores");
    expect(out).not.toContain("InstallPackage");
  });

  it("adds -D for a dev InstallPackage", () => {
    const out = stringifyCleanMarkdown('<InstallPackage pkg="typescript" dev />');
    expect(out).toContain("pnpm add -D typescript");
  });
});

describe("extractSections", () => {
  it("groups level-3 headings under the preceding level-2 heading", () => {
    const body = "## First\n\n### a\n\n### b\n\n## Second\n\n### c";
    expect(extractSections(body)).toEqual([
      { title: "First", methods: ["a", "b"] },
      { title: "Second", methods: ["c"] },
    ]);
  });

  it("ignores level-3 headings that appear before any level-2 heading", () => {
    expect(extractSections("### orphan\n\n## Real")).toEqual([{ title: "Real", methods: [] }]);
  });
});

describe("splitMarkdownIntoSections", () => {
  it("splits by heading with plain-text bodies", () => {
    const raw = "Intro.\n\n## First\n\nOne.\n\n## Second\n\nTwo.";
    expect(splitMarkdownIntoSections(raw)).toEqual([
      { heading: "", level: 0, body: "Intro." },
      { heading: "First", level: 2, body: "One." },
      { heading: "Second", level: 2, body: "Two." },
    ]);
  });

  it("assigns the page title to a leading untitled section", () => {
    const raw = "Intro.\n\n## First\n\nOne.";
    const [lead] = splitMarkdownIntoSections(raw, "My Page");
    expect(lead).toEqual({ heading: "My Page", level: 1, body: "Intro." });
  });
});

describe("formatSections", () => {
  const sections = [{ title: "First", methods: ["a", "b"] }];

  it("includes methods in deep mode", () => {
    expect(formatSections(sections, true)).toEqual(["  - First: a, b"]);
  });

  it("omits methods in shallow mode", () => {
    expect(formatSections(sections, false)).toEqual(["  - First"]);
  });
});
