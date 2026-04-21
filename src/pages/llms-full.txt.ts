import type { APIRoute } from "astro";
import { extraEntries } from "virtual:pigment-extra-entries";
import { siteConfig } from "virtual:pigment-config";
import { getDocsCollection } from "../utils/content";
import {
  markdownLinkItem,
  renderExtraEntryMarkdown,
  stringifyCleanMarkdown,
} from "../utils/markdown";
import { markdownResponse } from "../utils/response";
import { getHref } from "../utils/urls";

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();

  const docSections = docs.map((doc) =>
    [`# ${doc.data.title}`, "", stringifyCleanMarkdown(doc.body ?? "")].join("\n"),
  );

  const llmsExtra = extraEntries.filter((e) => e.llms !== false);
  const fullSections = llmsExtra
    .filter((entry) => entry.llmsFull !== false)
    .map(renderExtraEntryMarkdown);
  const linkOnly = llmsExtra
    .filter((entry) => entry.llmsFull === false)
    .map((entry) => markdownLinkItem(entry.title, getHref(`${entry.id}.md`), entry.description));

  const lines = [
    `# ${siteConfig.project.name}`,
    "",
    siteConfig.project.description,
    "",
    ...docSections,
    ...fullSections,
    ...(linkOnly.length > 0 ? ["", ...linkOnly] : []),
  ];

  return markdownResponse(lines.join("\n"));
};
