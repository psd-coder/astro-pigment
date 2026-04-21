import type { APIRoute } from "astro";
import { slug as githubSlug } from "github-slugger";
import { extraEntries } from "virtual:pigment-extra-entries";
import type { BlockEntry } from "../components/Search/types";
import { getDocsCollection } from "../utils/content";
import { splitMarkdownIntoSections } from "../utils/markdown";
import { jsonResponse } from "../utils/response";

function buildSections(
  pageId: string,
  pageTitle: string,
  pageOrder: number,
  body: string,
): BlockEntry[] {
  const sections = splitMarkdownIntoSections(body, pageTitle);
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

    entries.push({
      pageId,
      pageTitle,
      pageOrder,
      heading: section.heading,
      anchor,
      body: section.body,
    });
  }

  return entries;
}

export const GET: APIRoute = async () => {
  const docs = await getDocsCollection();
  const searchEntries = extraEntries.filter((e) => e.search !== false);

  const index: BlockEntry[] = [
    ...docs.flatMap((entry) =>
      entry.body ? buildSections(entry.id, entry.data.title, entry.data.order, entry.body) : [],
    ),
    ...searchEntries.flatMap((entry) =>
      entry.body
        ? buildSections(entry.id, entry.title, entry.order, entry.body)
        : [
            {
              pageId: entry.id,
              pageTitle: entry.title,
              pageOrder: entry.order,
              heading: "",
              anchor: "",
              body: entry.description,
            },
          ],
    ),
  ];

  return jsonResponse(index);
};
