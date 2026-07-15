// HTML void elements — self-closing syntax is honored for these, so leave them alone.
const HTML_VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Make an SVG safe to inline into an HTML document via `set:html`.
 *
 * `<foreignObject>` is an HTML integration point: the browser parses its content
 * with HTML rules, where XML self-closing syntax on non-void elements is ignored.
 * A Figma-exported `<div .../>` inside it thus parses as an *unclosed* `<div>` that
 * swallows the rest of the document. Expand such tags to explicit open/close pairs
 * (which renders identically to a well-formed export) without touching SVG markup.
 */
export function sanitizeInlineSvg(svg: string): string {
  return svg.replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, (block) =>
    block.replace(
      /<([a-z][\w-]*)((?:"[^"]*"|'[^']*'|[^"'>])*?)\s*\/>/gi,
      (match, tag: string, attrs: string) =>
        HTML_VOID_ELEMENTS.has(tag.toLowerCase()) ? match : `<${tag}${attrs}></${tag}>`,
    ),
  );
}
