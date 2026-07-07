import { describe, expect, it } from "vitest";
import { generateScopedName } from "./cssModules";

// A path that does not exist on disk, so realpathSync falls back to the bare
// path and the hash stays deterministic across machines.
const FILE = "/project/src/components/Tabs/styles.module.css";

describe("generateScopedName", () => {
  it("formats as Dir__name_hash using the parent directory", () => {
    expect(generateScopedName("title", FILE)).toMatch(/^Tabs__title_[0-9a-f]{5}$/);
  });

  it("is deterministic for the same name and file", () => {
    expect(generateScopedName("title", FILE)).toBe(generateScopedName("title", FILE));
  });

  it("ignores Vite query suffixes", () => {
    expect(generateScopedName("title", `${FILE}?inline`)).toBe(generateScopedName("title", FILE));
  });

  it("produces different hashes for different class names", () => {
    expect(generateScopedName("title", FILE)).not.toBe(generateScopedName("body", FILE));
  });
});
