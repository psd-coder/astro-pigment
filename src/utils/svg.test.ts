import { describe, expect, it } from "vitest";
import { sanitizeInlineSvg } from "./svg";

describe("sanitizeInlineSvg", () => {
  it("expands a self-closing div inside foreignObject to an open/close pair", () => {
    const svg =
      '<svg><foreignObject width="10" height="10">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="background:conic-gradient(from 90deg,#07aaa0 0deg)"/>' +
      "</foreignObject></svg>";
    expect(sanitizeInlineSvg(svg)).toBe(
      '<svg><foreignObject width="10" height="10">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="background:conic-gradient(from 90deg,#07aaa0 0deg)"></div>' +
        "</foreignObject></svg>",
    );
  });

  it("leaves an already well-formed div untouched", () => {
    const svg = '<svg><foreignObject><div style="width:100%"></div></foreignObject></svg>';
    expect(sanitizeInlineSvg(svg)).toBe(svg);
  });

  it("does not touch self-closing SVG elements outside foreignObject", () => {
    const svg = '<svg><path d="M0 0"/><circle cx="1" cy="1" r="1"/></svg>';
    expect(sanitizeInlineSvg(svg)).toBe(svg);
  });

  it("keeps void HTML elements self-closed", () => {
    const svg = "<svg><foreignObject><div><br/><img src=x/></div></foreignObject></svg>";
    expect(sanitizeInlineSvg(svg)).toBe(svg);
  });

  it("handles multiple foreignObject blocks", () => {
    const svg =
      "<svg><foreignObject><div/></foreignObject><foreignObject><span/></foreignObject></svg>";
    expect(sanitizeInlineSvg(svg)).toBe(
      "<svg><foreignObject><div></div></foreignObject><foreignObject><span></span></foreignObject></svg>",
    );
  });

  it("does not break on a self-closing div-like value inside an attribute string", () => {
    const svg = '<svg><foreignObject><div data-x="<b/>"/></foreignObject></svg>';
    expect(sanitizeInlineSvg(svg)).toBe(
      '<svg><foreignObject><div data-x="<b/>"></div></foreignObject></svg>',
    );
  });
});
