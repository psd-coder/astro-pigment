import { findTermRanges, tokenizeQuery } from "./tokenize";

export const QUERY_PARAM = "q";

const HIGHLIGHT_ID = "search-result";
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";

function getHeadingLevel(el: Element): number {
  return Number(el.tagName[1]);
}

/** Collect all DOM nodes between a heading and the next heading of equal/higher level. */
function getSectionElements(anchor: Element): Element[] {
  const level = getHeadingLevel(anchor);
  const elements: Element[] = [anchor];
  let sibling = anchor.nextElementSibling;

  while (sibling) {
    if (sibling.matches(HEADING_SELECTOR) && getHeadingLevel(sibling) <= level) break;
    elements.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  return elements;
}

export function applySearchHighlight() {
  CSS.highlights.delete(HIGHLIGHT_ID);

  const query = new URL(location.href).searchParams.get(QUERY_PARAM);
  if (!query) return;

  const hash = location.hash.slice(1);
  const anchor = hash ? document.getElementById(hash) : null;
  const heading = anchor?.matches(HEADING_SELECTOR) ? anchor : anchor?.closest(HEADING_SELECTOR);
  const roots = heading ? getSectionElements(heading) : [document.body];

  const terms = tokenizeQuery(query);
  if (terms.length === 0) return;

  const ranges: Range[] = [];

  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      for (const [start, end] of findTermRanges(node.textContent ?? "", terms)) {
        const range = new Range();
        range.setStart(node, start);
        range.setEnd(node, end);
        ranges.push(range);
      }
    }
  }

  if (ranges.length > 0) {
    CSS.highlights.set(HIGHLIGHT_ID, new Highlight(...ranges));
  }
}
