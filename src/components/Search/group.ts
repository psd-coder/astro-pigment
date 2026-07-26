import { extractSnippet } from "./snippet";
import type { BlockEntry, GroupedSearchResult } from "./types";

// TF-IDF scores are only meaningful relative to the query: a rare word puts its
// best hit near 0, a word common across the corpus puts an equally correct hit
// near 0.8. So the tail is trimmed by distance from the best hit, not absolutely.
const SCORE_GAP = 0.35;
const BLOCKS_PER_PAGE = 5;
const PAGE_LIMIT = 8;

export type ScoredBlock = { item: BlockEntry; score: number };

type PageGroup = GroupedSearchResult & { pageOrder: number; score: number };

/** Collapse score-ordered blocks into pages ranked by their best block. */
export function groupResults(results: ScoredBlock[], terms: string[]): GroupedSearchResult[] {
  const groupMap = new Map<string, PageGroup>();
  const worstKept = (results[0]?.score ?? 0) + SCORE_GAP;

  for (const { item, score } of results) {
    if (score > worstKept) break;

    const { pageId, pageTitle, pageOrder, heading, anchor } = item;
    let group = groupMap.get(pageId);

    if (!group) {
      // Blocks arrive best-first, so the first one seen scores the page
      group = { pageId, pageTitle, pageOrder, score, blocks: [] };
      groupMap.set(pageId, group);
    }

    // A long section is indexed as several chunks sharing one anchor; keep the best
    if (group.blocks.some((block) => block.anchor === anchor)) continue;

    group.blocks.push({ pageId, heading, anchor, snippet: extractSnippet(item.body, terms) });
  }

  return [...groupMap.values()]
    .sort((a, b) => a.score - b.score || a.pageOrder - b.pageOrder)
    .slice(0, PAGE_LIMIT)
    .map(({ pageOrder: _pageOrder, score: _score, ...group }) => ({
      ...group,
      blocks: group.blocks.slice(0, BLOCKS_PER_PAGE),
    }));
}
