import Fuse from "fuse.js";
import { createPostMessageTransport, createTypedChannel } from "typed-channel";
import type { BlockEntry, ClientMessages, GroupedSearchResult, WorkerMessages } from "./types";

const postMessageTransport = createPostMessageTransport<ClientMessages, WorkerMessages>(globalThis);
const clientChannel = createTypedChannel(postMessageTransport);
let fuse: Fuse<BlockEntry> | null = null;
const SNIPPET_SURROUND_CONTEXT = 80;

// Find the query in body text and extract surrounding context at word boundaries
function extractSnippet(body: string, query: string): string {
  if (!body) return "";

  const idx = body.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    const limit = SNIPPET_SURROUND_CONTEXT * 2;
    return body.slice(0, limit).trim() + (body.length > limit ? "..." : "");
  }

  let from = Math.max(0, idx - SNIPPET_SURROUND_CONTEXT);
  let to = Math.min(body.length, idx + query.length + SNIPPET_SURROUND_CONTEXT);

  if (from > 0) {
    const space = body.lastIndexOf(" ", from);
    if (space !== -1) from = space + 1;
  }
  if (to < body.length) {
    const space = body.indexOf(" ", to);
    if (space !== -1) to = space;
  }

  let snippet = body.slice(from, to).trim();
  if (from > 0) snippet = "..." + snippet;
  if (to < body.length) snippet = snippet + "...";

  return snippet;
}

clientChannel.on("init", ({ data }) => {
  fuse = new Fuse(data, {
    keys: [
      { name: "heading", weight: 3 },
      { name: "body", weight: 1 },
    ],
    useTokenSearch: true,
    threshold: 0.2,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
});

clientChannel.on("search", ({ query }) => {
  if (!fuse) return;

  const results = fuse.search(query, { limit: 20 });
  const groupMap = new Map<string, GroupedSearchResult & { pageOrder: number }>();

  for (const r of results) {
    const { pageId, pageTitle, pageOrder, heading, anchor } = r.item;

    if (!groupMap.has(pageId)) {
      groupMap.set(pageId, { pageId, pageTitle, pageOrder, blocks: [] });
    }

    groupMap.get(pageId)!.blocks.push({
      pageId,
      heading,
      anchor,
      snippet: extractSnippet(r.item.body, query),
    });
  }

  const grouped: GroupedSearchResult[] = [...groupMap.values()]
    .sort((a, b) => a.pageOrder - b.pageOrder)
    .map(({ pageOrder: _, ...group }) => ({
      ...group,
      blocks: group.blocks.slice(0, 5),
    }));

  clientChannel.emit("search-results", { data: grouped });
});
