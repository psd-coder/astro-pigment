// Mirrors Fuse's default tokenizer so snippets and highlights mark the same
// terms the ranker matched on.
const TOKEN_RE = /[\p{L}\p{M}\p{N}_]+/gu;
const MIN_TERM_LENGTH = 2;

export function tokenizeQuery(query: string): string[] {
  const terms = query.toLowerCase().match(TOKEN_RE) ?? [];
  return [...new Set(terms.filter((term) => term.length >= MIN_TERM_LENGTH))];
}

export type TermRange = [start: number, end: number];

/** Sorted, non-overlapping ranges where any term occurs in text. */
export function findTermRanges(text: string, terms: string[]): TermRange[] {
  if (!text || terms.length === 0) return [];

  const lower = text.toLowerCase();
  const hits: TermRange[] = [];

  for (const term of terms) {
    let from = 0;
    let idx = lower.indexOf(term, from);
    while (idx !== -1) {
      hits.push([idx, idx + term.length]);
      from = idx + term.length;
      idx = lower.indexOf(term, from);
    }
  }

  hits.sort((a, b) => a[0] - b[0]);

  const merged: TermRange[] = [];
  for (const hit of hits) {
    const last = merged[merged.length - 1];
    if (last && hit[0] <= last[1]) last[1] = Math.max(last[1], hit[1]);
    else merged.push([hit[0], hit[1]]);
  }

  return merged;
}
