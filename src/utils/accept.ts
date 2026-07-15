const MARKDOWN_TYPES = new Set(["text/markdown", "text/x-markdown"]);

type MediaRange = { type: string; q: number };

function parseAccept(header: string): MediaRange[] {
  return header
    .split(",")
    .map((part) => {
      const [type = "", ...params] = part
        .trim()
        .split(";")
        .map((s) => s.trim());
      let q = 1;
      for (const param of params) {
        const match = /^q=(.*)$/i.exec(param);
        if (match) {
          const parsed = Number.parseFloat(match[1] ?? "");
          if (!Number.isNaN(parsed)) q = parsed;
        }
      }
      return { type: type.toLowerCase(), q };
    })
    .filter((range) => range.type.length > 0);
}

/**
 * Provider-agnostic content negotiation: true when the client explicitly asks
 * for markdown (`text/markdown` / `text/x-markdown`) with non-zero quality and
 * prefers it at least as much as HTML. A wildcard accept never counts as
 * markdown, so browsers and generic clients keep receiving HTML.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  let markdownQ = -1;
  let htmlQ = -1;
  for (const { type, q } of parseAccept(accept)) {
    if (MARKDOWN_TYPES.has(type)) markdownQ = Math.max(markdownQ, q);
    else if (type === "text/html") htmlQ = Math.max(htmlQ, q);
  }
  return markdownQ > 0 && markdownQ >= htmlQ;
}
