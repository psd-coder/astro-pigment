import type { Code, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

const parser = unified().use(remarkParse).use(remarkFrontmatter, ["yaml", "toml"]).use(remarkMdx);

const stringifier = unified()
  .use(remarkStringify, { bullet: "-", rule: "-", fence: "`", fences: true })
  .use(remarkFrontmatter, ["yaml", "toml"])
  .use(remarkMdx);

const DROP = new Set(["yaml", "toml", "mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"]);
const UNWRAP = new Set(["mdxJsxFlowElement", "mdxJsxTextElement"]);

// The <InstallPackage> component renders per-manager tabs on the page; in the
// clean markdown twin (for LLMs) it collapses to a single pnpm command so the
// instruction survives instead of unwrapping to nothing.
function installPackageCode(node: unknown): Code | undefined {
  const el = node as {
    type?: string;
    name?: unknown;
    attributes?: Array<{ type?: string; name?: unknown; value?: unknown }>;
  };
  if (el.type !== "mdxJsxFlowElement" || el.name !== "InstallPackage") return undefined;
  const attrs = Array.isArray(el.attributes) ? el.attributes : [];
  const pkg = attrs.find((a) => a?.type === "mdxJsxAttribute" && a.name === "pkg");
  if (typeof pkg?.value !== "string") return undefined;
  const dev = attrs.some((a) => a?.type === "mdxJsxAttribute" && a.name === "dev");
  return { type: "code", lang: "sh", value: `pnpm add${dev ? " -D" : ""} ${pkg.value}` };
}

function stripMdxNodes(tree: Root): void {
  visit(tree, (node, index, parent) => {
    if (!parent || index === undefined) return undefined;
    if (DROP.has(node.type)) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    const installCode = installPackageCode(node);
    if (installCode) {
      parent.children.splice(index, 1, installCode as RootContent);
      return [SKIP, index];
    }
    if (UNWRAP.has(node.type) && "children" in node) {
      parent.children.splice(index, 1, ...(node.children as RootContent[]));
      return [SKIP, index];
    }
    return undefined;
  });
}

function nodesToPlainText(nodes: RootContent[]): string {
  return nodes
    .map((n) => toString(n))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stringifyCleanMarkdown(body: string): string {
  const tree = parser.parse(body);
  stripMdxNodes(tree);
  return String(stringifier.stringify(tree));
}

export function markdownLinkItem(title: string, url: string, description: string): string {
  return `- [${title}](${url}): ${description}`;
}

export function renderExtraEntryMarkdown(entry: {
  title: string;
  description: string;
  body?: string;
}): string {
  const parts = [`# ${entry.title}`, "", entry.description];
  if (entry.body) parts.push("", stringifyCleanMarkdown(entry.body));
  return parts.join("\n");
}

type Section = { title: string; methods: string[] };

export function extractSections(body: string): Section[] {
  const tree = parser.parse(body);
  stripMdxNodes(tree);
  const result: Section[] = [];

  for (const node of tree.children) {
    if (node.type !== "heading") continue;
    const text = toString(node);
    if (node.depth === 2) result.push({ title: text, methods: [] });
    else if (node.depth === 3 && result.length) result[result.length - 1]!.methods.push(text);
  }

  return result;
}

type MarkdownSection = { heading: string; level: number; body: string };

export function splitMarkdownIntoSections(raw: string, pageTitle?: string): MarkdownSection[] {
  const tree = parser.parse(raw);
  stripMdxNodes(tree);
  const sections: MarkdownSection[] = [];
  let heading = "";
  let level = 0;
  let buffer: RootContent[] = [];

  for (const node of tree.children) {
    if (node.type === "heading") {
      const body = nodesToPlainText(buffer);
      if (body || heading) sections.push({ heading, level, body });
      heading = toString(node);
      level = node.depth;
      buffer = [];
    } else {
      buffer.push(node);
    }
  }

  const body = nodesToPlainText(buffer);
  if (body || heading) sections.push({ heading, level, body });

  if (sections.length && sections[0]!.heading === "" && pageTitle) {
    sections[0]!.heading = pageTitle;
    sections[0]!.level = 1;
  }

  return sections;
}

export function formatSections(sections: Section[], deep: boolean): string[] {
  return sections.map((s) => {
    if (deep && s.methods.length) return `  - ${s.title}: ${s.methods.join(", ")}`;
    return `  - ${s.title}`;
  });
}
