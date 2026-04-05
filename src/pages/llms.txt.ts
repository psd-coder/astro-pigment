import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig, docsConfig } from "virtual:theme-integration-config";
import { extractSections, formatSections } from "../utils/markdown";

const base = import.meta.env.BASE_URL;

const DEEP_SLUGS = new Set(docsConfig?.deepSections ?? []);

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).sort(
    (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order,
  );

  const sections = docs.map((doc: { id: string; data: { title: string; description: string } }) => {
    const headings = extractSections(docsConfig!.directory, doc.id);
    return [
      `## ${doc.data.title}`,
      "",
      `- [${doc.data.title}](${base}${doc.id}.md): ${doc.data.description}`,
      ...formatSections(headings, DEEP_SLUGS.has(doc.id)),
    ].join("\n");
  });

  const lines = [
    `# ${siteConfig.project.name}`,
    "",
    siteConfig.project.description,
    "",
    `- [llms-full.txt](${base}llms-full.txt): Complete documentation in a single file`,
    "",
    ...sections,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
