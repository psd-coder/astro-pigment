import type { APIRoute } from "astro";
import { docsConfig, siteConfig } from "virtual:theme-integration-config";
import { getDocsCollection } from "../utils/content";
import { extractSections, formatSections } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

const base = import.meta.env.BASE_URL;

const DEEP_SLUGS = new Set(docsConfig?.deepSections ?? []);

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();

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

  return markdownResponse(lines.join("\n"));
};
