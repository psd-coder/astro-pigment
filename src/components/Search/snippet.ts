import { findTermRanges, type TermRange } from "./tokenize";

const SNIPPET_SURROUND_CONTEXT = 80;
// How far apart two term hits can be and still count as the same cluster
const CLUSTER_WINDOW = 160;

/** The window covering the most distinct query terms, earliest one winning ties. */
function densestCluster(body: string, ranges: TermRange[]): TermRange {
  const lower = body.toLowerCase();
  const first = ranges[0]!;
  let best: TermRange = [first[0], first[1]];
  let bestCount = 0;

  for (let i = 0; i < ranges.length; i++) {
    const start = ranges[i]![0];
    const seen = new Set<string>();
    let end = ranges[i]![1];

    for (let j = i; j < ranges.length && ranges[j]![0] < start + CLUSTER_WINDOW; j++) {
      seen.add(lower.slice(ranges[j]![0], ranges[j]![1]));
      end = ranges[j]![1];
    }

    if (seen.size > bestCount) {
      bestCount = seen.size;
      best = [start, end];
    }
  }

  return best;
}

/** Extract the passage of body richest in query terms, cut at word boundaries. */
export function extractSnippet(body: string, terms: string[]): string {
  if (!body) return "";

  const ranges = findTermRanges(body, terms);
  if (ranges.length === 0) {
    const limit = SNIPPET_SURROUND_CONTEXT * 2;
    return body.slice(0, limit).trim() + (body.length > limit ? "..." : "");
  }

  const [clusterStart, clusterEnd] = densestCluster(body, ranges);
  let from = Math.max(0, clusterStart - SNIPPET_SURROUND_CONTEXT);
  let to = Math.min(body.length, clusterEnd + SNIPPET_SURROUND_CONTEXT);

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
