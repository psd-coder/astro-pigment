import type { APIRoute } from "astro";
import { extraEntries } from "virtual:pigment-extra-entries";
import { siteConfig } from "virtual:pigment-config";
import { getDocsCollection } from "../utils/content";
import { extractSections, formatSections, markdownLinkItem } from "../utils/markdown";
import { markdownResponse } from "../utils/response";
import { getHref } from "../utils/urls";

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();

  const docSections = docs.map((doc) => {
    const headings = extractSections(doc.body ?? "");
    return [
      `## ${doc.data.title}`,
      "",
      markdownLinkItem(doc.data.title, getHref(`${doc.id}.md`), doc.data.description),
      ...formatSections(headings, true),
    ].join("\n");
  });

  const extraSections = extraEntries
    .filter((e) => e.llms !== false)
    .map((entry) => {
      const headings = extractSections(entry.body ?? "");
      const link = markdownLinkItem(entry.title, getHref(`${entry.id}.md`), entry.description);
      return [`## ${entry.title}`, "", link, ...formatSections(headings, true)].join("\n");
    });

  const lines = [
    `# ${siteConfig.project.name}`,
    "",
    siteConfig.project.description,
    "",
    markdownLinkItem(
      "llms-full.txt",
      getHref("llms-full.txt"),
      "Complete documentation in a single file",
    ),
    "",
    ...docSections,
    ...extraSections,
    "",
  ];

  return markdownResponse(lines.join("\n"));
};
