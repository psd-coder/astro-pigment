import type { APIRoute } from "astro";
import { siteConfig } from "virtual:theme-integration-config";
import { getDocsCollection } from "../utils/content";
import { stringifyCleanMarkdown } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();

  const sections = docs.map((doc) =>
    [`# ${doc.data.title}`, "", stringifyCleanMarkdown(doc.body ?? "")].join("\n"),
  );

  const lines = [
    `# ${siteConfig.project.name}`,
    "",
    siteConfig.project.description,
    "",
    ...sections,
  ];

  return markdownResponse(lines.join("\n"));
};
