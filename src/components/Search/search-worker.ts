import Fuse from "fuse.js";
import { createPostMessageTransport, createTypedChannel } from "typed-channel";
import { groupResults } from "./group";
import { tokenizeQuery } from "./tokenize";
import type { BlockEntry, ClientMessages, WorkerMessages } from "./types";

const postMessageTransport = createPostMessageTransport<ClientMessages, WorkerMessages>(globalThis);
const clientChannel = createTypedChannel(postMessageTransport);
let fuse: Fuse<BlockEntry> | null = null;

const BLOCK_LIMIT = 100;

clientChannel.on("init", ({ data }) => {
  fuse = new Fuse(data, {
    keys: [
      { name: "heading", weight: 3 },
      { name: "pageTitle", weight: 2 },
      { name: "body", weight: 1 },
    ],
    useTokenSearch: true,
    // Every query word must appear somewhere in the block, so adding a word narrows
    tokenMatch: "all",
    threshold: 0.2,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  });
});

clientChannel.on("search", ({ query }) => {
  if (!fuse) return;

  const results = fuse
    .search(query, { limit: BLOCK_LIMIT })
    .map((r) => ({ item: r.item, score: r.score ?? 1 }));

  clientChannel.emit("search-results", { data: groupResults(results, tokenizeQuery(query)) });
});
