import type { APIRoute } from "astro";
import { slug as githubSlug } from "github-slugger";
import { extraEntries } from "virtual:pigment-extra-entries";
import type { BlockEntry } from "../components/Search/types";
import { getDocsCollection } from "../utils/content";
import { splitMarkdownIntoSections } from "../utils/markdown";
import { jsonResponse } from "../utils/response";

// A whole reference section indexed as one block skews TF-IDF field norms and
// yields snippets from anywhere in it; chunking keeps matches local to the text
const MAX_BLOCK_CHARS = 1000;

function chunkBody(body: string): string[] {
  if (body.length <= MAX_BLOCK_CHARS) return [body];

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < body.length) {
    let end = Math.min(body.length, cursor + MAX_BLOCK_CHARS);
    if (end < body.length) {
      const space = body.lastIndexOf(" ", end);
      if (space > cursor) end = space;
    }
    const chunk = body.slice(cursor, end).trim();
    if (chunk) chunks.push(chunk);
    cursor = end;
  }

  return chunks;
}

type PageMeta = Pick<BlockEntry, "pageId" | "pageTitle" | "pageOrder" | "description">;

function buildSections(page: PageMeta, body: string): BlockEntry[] {
  const sections = splitMarkdownIntoSections(body, page.pageTitle);
  const slugOccurrences = new Map<string, number>();
  const entries: BlockEntry[] = [];

  for (const section of sections) {
    let anchor = "";
    if (section.heading) {
      const baseSlug = githubSlug(section.heading);
      const count = slugOccurrences.get(baseSlug) ?? 0;
      anchor = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      slugOccurrences.set(baseSlug, count + 1);
    }

    if (!section.body && !section.heading) continue;

    for (const chunk of section.body ? chunkBody(section.body) : [""]) {
      entries.push({ ...page, heading: section.heading, anchor, body: chunk });
    }
  }

  return entries;
}

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();
  const searchEntries = extraEntries.filter((e) => e.search !== false);

  const index: BlockEntry[] = [
    ...docs.flatMap((entry) => {
      const page = {
        pageId: entry.id,
        pageTitle: entry.data.title,
        pageOrder: entry.data.order,
        description: entry.data.description,
      };
      return entry.body ? buildSections(page, entry.body) : [];
    }),
    ...searchEntries.flatMap((entry) => {
      const page = {
        pageId: entry.id,
        pageTitle: entry.title,
        pageOrder: entry.order,
        description: entry.description,
      };
      return entry.body
        ? buildSections(page, entry.body)
        : [{ ...page, heading: "", anchor: "", body: entry.description }];
    }),
  ];

  return jsonResponse(index);
};
