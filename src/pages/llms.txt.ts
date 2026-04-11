import type { APIRoute } from "astro";
import { siteConfig } from "virtual:theme-integration-config";
import { getDocsCollection } from "../utils/content";
import { extractSections, formatSections } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

const base = import.meta.env.BASE_URL;

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();

  const sections = docs.map((doc) => {
    const headings = extractSections(doc.body ?? "");
    return [
      `## ${doc.data.title}`,
      "",
      `- [${doc.data.title}](${base}${doc.id}.md): ${doc.data.description}`,
      ...formatSections(headings, true),
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
