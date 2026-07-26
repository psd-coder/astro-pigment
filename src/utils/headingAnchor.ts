import { defineHastPlugin } from "satteri";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

// Prepend a self-link permalink to every heading that carries an id, matching what
// rehype-autolink-headings did with `behavior: "prepend"`. The link has no visible text, so
// its accessible name comes from aria-label built off the heading's flattened inline content.
//
// Runs after `satteriHeadingIdsPlugin()`, which is what assigns the ids.
export const headingAnchorPlugin = defineHastPlugin({
  name: "pigment-heading-anchors",
  element: {
    filter: HEADING_TAGS,
    visit(node, ctx) {
      const id = node.properties?.["id"];
      if (id === undefined || id === null || id === "") return;

      ctx.prependChild(node, {
        type: "element",
        tagName: "a",
        properties: {
          href: `#${String(id)}`,
          className: ["anchor"],
          ariaLabel: `Section titled "${ctx.textContent(node)}"`,
        },
        children: [],
      });
    },
  },
});
