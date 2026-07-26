import type { Element } from "hast";
import { describe, expect, it } from "vitest";
import { headingAnchorPlugin } from "./headingAnchor";

type PrependedChild = { node: Element; child: Element };

// Minimal stand-in for Sätteri's hast visitor context: the plugin only reaches for
// `prependChild` and `textContent`, so the fake records the former and canned-answers the latter.
function createContext(textContent: string) {
  const prepended: PrependedChild[] = [];

  return {
    prepended,
    ctx: {
      prependChild: (node: Element, child: Element) => prepended.push({ node, child }),
      textContent: () => textContent,
    },
  };
}

const heading = (properties: Element["properties"]): Element => ({
  type: "element",
  tagName: "h2",
  properties,
  children: [],
});

// The plugin is typed against Sätteri's context; the fake supplies only the two members it uses.
const visit = headingAnchorPlugin.element.visit as unknown as (
  node: Element,
  ctx: ReturnType<typeof createContext>["ctx"],
) => void;

describe("headingAnchorPlugin", () => {
  it("subscribes to every heading level", () => {
    expect(headingAnchorPlugin.element.filter).toEqual(["h1", "h2", "h3", "h4", "h5", "h6"]);
  });

  it("prepends a self-link pointing at the heading id", () => {
    const { ctx, prepended } = createContext("Getting Started");
    const node = heading({ id: "getting-started" });

    visit(node, ctx);

    expect(prepended).toHaveLength(1);
    expect(prepended[0]?.child).toMatchObject({
      tagName: "a",
      properties: {
        href: "#getting-started",
        className: ["anchor"],
        ariaLabel: 'Section titled "Getting Started"',
      },
      children: [],
    });
  });

  it("names the link from the heading's flattened inline content", () => {
    const { ctx, prepended } = createContext("Using render() with MDX");

    visit(heading({ id: "using-render-with-mdx" }), ctx);

    expect(prepended[0]?.child.properties?.["ariaLabel"]).toBe(
      'Section titled "Using render() with MDX"',
    );
  });

  it("skips headings without an id", () => {
    const { ctx, prepended } = createContext("No anchor");

    visit(heading({}), ctx);
    visit(heading({ id: "" }), ctx);

    expect(prepended).toHaveLength(0);
  });
});
