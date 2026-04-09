import type { APIRoute } from "astro";
import { docsConfig, siteConfig } from "virtual:theme-integration-config";
import { getDocsCollection } from "../utils/content";
import { readDocFile } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();
  const parts = docs.map(
    (doc: { id: string; data: { title: string } }) =>
      `# ${doc.data.title}\n\n${readDocFile(docsConfig!.directory, doc.id)}`,
  );
  const content = `# ${siteConfig.project.name}\n\n${siteConfig.project.description}\n\n${parts.join("\n\n")}`;

  return markdownResponse(content);
};
