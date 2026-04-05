import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig, docsConfig } from "virtual:theme-integration-config";
import { readDocFile } from "../utils/markdown";

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).sort(
    (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order,
  );
  const parts = docs.map(
    (doc: { id: string; data: { title: string } }) =>
      `# ${doc.data.title}\n\n${readDocFile(docsConfig!.directory, doc.id)}`,
  );
  const content = `# ${siteConfig.project.name}\n\n${siteConfig.project.description}\n\n${parts.join("\n\n")}`;

  return new Response(content, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
