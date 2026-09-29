import type { APIRoute, GetStaticPaths } from "astro";
import { extraEntries } from "virtual:pigment-extra-entries";
import { agentSkills } from "virtual:pigment-config";
import { agentSkillsComponents } from "../utils/agentSkillsMarkdown";
import { getDocsCollection } from "../utils/content";
import { renderExtraEntryMarkdown, stringifyCleanMarkdown } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

const llmsEntries = extraEntries.filter((e) => e.llms !== false);
const components = agentSkillsComponents(agentSkills);

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getDocsCollection();
  return [
    ...docs.map((doc: { id: string }) => ({ params: { slug: doc.id } })),
    ...llmsEntries.map((e) => ({ params: { slug: e.id } })),
  ];
};

export const GET: APIRoute = async ({ params }) => {
  const docs = await getDocsCollection();
  const doc = docs.find((d) => d.id === params.slug);
  if (doc?.body) return markdownResponse(stringifyCleanMarkdown(doc.body, components));

  const extra = llmsEntries.find((e) => e.id === params.slug);
  if (extra) return markdownResponse(renderExtraEntryMarkdown(extra));

  return new Response(null, { status: 404 });
};
