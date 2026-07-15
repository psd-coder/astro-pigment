import { describe, expect, it } from "vitest";
import { headingText, type HeadingNode } from "./headingAnchor";

const heading = (...children: HeadingNode[]): HeadingNode => ({ type: "element", children });
const text = (value: string): HeadingNode => ({ type: "text", value });
const el = (_tagName: string, ...children: HeadingNode[]): HeadingNode => ({
  type: "element",
  children,
});

describe("headingText", () => {
  it("returns plain text of a simple heading", () => {
    expect(headingText(heading(text("Getting Started")))).toBe("Getting Started");
  });

  it("flattens nested inline markup (code, links, emphasis)", () => {
    expect(
      headingText(
        heading(
          text("Using "),
          el("code", text("render()")),
          text(" with "),
          el("em", text("MDX")),
        ),
      ),
    ).toBe("Using render() with MDX");
  });

  it("returns an empty string for a heading with no text nodes", () => {
    expect(headingText(heading(el("span")))).toBe("");
  });

  it("reads a bare text node", () => {
    expect(headingText(text("Overview"))).toBe("Overview");
  });
});
