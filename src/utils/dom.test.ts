import { describe, expect, it } from "vitest";
import { matchesHotkey } from "./dom";

function event(overrides: {
  key: string;
  code: string;
  shift?: boolean;
  ctrl?: boolean;
  composing?: boolean;
}) {
  return {
    key: overrides.key,
    code: overrides.code,
    shiftKey: overrides.shift ?? false,
    ctrlKey: overrides.ctrl ?? false,
    metaKey: false,
    altKey: false,
    isComposing: overrides.composing ?? false,
  };
}

describe("matchesHotkey", () => {
  it("matches the character on an ANSI layout", () => {
    expect(matchesHotkey(event({ key: "/", code: "Slash" }), "/")).toBe(true);
  });

  it("matches the physical key on a Cyrillic layout", () => {
    expect(matchesHotkey(event({ key: ".", code: "Slash" }), "/")).toBe(true);
  });

  it("matches a layout where the character needs Shift", () => {
    expect(matchesHotkey(event({ key: "/", code: "Digit7", shift: true }), "/")).toBe(true);
  });

  it("ignores the shifted character of the physical key", () => {
    expect(matchesHotkey(event({ key: "?", code: "Slash", shift: true }), "/")).toBe(false);
    expect(matchesHotkey(event({ key: ",", code: "Slash", shift: true }), "/")).toBe(false);
  });

  it("ignores combinations with a modifier", () => {
    expect(matchesHotkey(event({ key: "/", code: "Slash", ctrl: true }), "/")).toBe(false);
    expect(matchesHotkey({ ...event({ key: "/", code: "Slash" }), metaKey: true }, "/")).toBe(
      false,
    );
    expect(matchesHotkey({ ...event({ key: "/", code: "Slash" }), altKey: true }, "/")).toBe(false);
  });

  it("ignores an unrelated key", () => {
    expect(matchesHotkey(event({ key: "a", code: "KeyA" }), "/")).toBe(false);
  });

  it("ignores a Latin letter on the physical key, as Dvorak has", () => {
    expect(matchesHotkey(event({ key: "z", code: "Slash" }), "/")).toBe(false);
    expect(matchesHotkey(event({ key: "Z", code: "Slash" }), "/")).toBe(false);
  });

  it("ignores keystrokes an input method is composing", () => {
    expect(matchesHotkey(event({ key: "Process", code: "Slash", composing: true }), "/")).toBe(
      false,
    );
  });

  it("resolves the physical key for letters and digits too", () => {
    expect(matchesHotkey(event({ key: "о", code: "KeyJ" }), "j")).toBe(true);
    expect(matchesHotkey(event({ key: '"', code: "Digit3" }), "3")).toBe(true);
  });

  it("falls back to the character alone when the hotkey has no known physical key", () => {
    expect(matchesHotkey(event({ key: "?", code: "Slash" }), "?")).toBe(true);
    expect(matchesHotkey(event({ key: ".", code: "Slash" }), "?")).toBe(false);
  });
});
