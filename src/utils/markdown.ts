import { readFileSync } from "node:fs";

export function readDocFile(directory: string, slug: string): string {
  let raw: string;
  try {
    raw = readFileSync(`${directory}/${slug}.md`, "utf-8");
  } catch {
    raw = readFileSync(`${directory}/${slug}.mdx`, "utf-8");
  }
  return cleanMarkdown(raw);
}

export function cleanMarkdown(raw: string): string {
  return raw.replace(/^---\n[\s\S]*?\n---\n*/, "").replace(/^import\s+.*;\s*\n/gm, "");
}

type Section = { title: string; methods: string[] };

export function extractSections(directory: string, slug: string): Section[] {
  const result: Section[] = [];
  for (const l of readDocFile(directory, slug).split("\n")) {
    if (l.startsWith("## ")) result.push({ title: l.slice(3), methods: [] });
    else if (l.startsWith("### ") && result.length)
      result[result.length - 1]!.methods.push(l.slice(4));
  }
  return result;
}

export function formatSections(sections: Section[], deep: boolean): string[] {
  return sections.map((s) => {
    if (deep && s.methods.length) return `  - ${s.title}: ${s.methods.join(", ")}`;
    return `  - ${s.title}`;
  });
}
