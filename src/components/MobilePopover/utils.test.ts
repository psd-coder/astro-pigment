import { describe, expect, it } from "vitest";
import { hasMobilePopover, registerMobilePopover } from "./utils";

describe("mobilePopovers", () => {
  it("reports nothing registered on untouched locals", () => {
    const locals: App.Locals = {};

    expect(hasMobilePopover(locals, "nav")).toBe(false);
    expect(hasMobilePopover(locals, "toc")).toBe(false);
  });

  it("reports only what was registered", () => {
    const locals: App.Locals = {};
    registerMobilePopover(locals, "toc");

    expect(hasMobilePopover(locals, "toc")).toBe(true);
    expect(hasMobilePopover(locals, "nav")).toBe(false);
  });

  it("keeps earlier registrations when a second panel registers", () => {
    const locals: App.Locals = {};
    registerMobilePopover(locals, "nav");
    registerMobilePopover(locals, "toc");
    registerMobilePopover(locals, "nav");

    expect(locals.pigmentMobilePopovers?.size).toBe(2);
    expect(hasMobilePopover(locals, "nav")).toBe(true);
    expect(hasMobilePopover(locals, "toc")).toBe(true);
  });
});
