import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseSkill, readSkills, repoRelativePath } from "./skills";

function skillMd(frontmatter: string, body = "Body"): string {
  return `---\n${frontmatter}\n---\n\n${body}\n`;
}

describe("parseSkill", () => {
  it("reads name and description from the frontmatter", () => {
    const md = skillMd("name: lint-rules\ndescription: Lint the code.\nlicense: MIT");
    expect(parseSkill("lint-rules", md)).toEqual({
      name: "lint-rules",
      description: "Lint the code.",
    });
  });

  it("reads a folded multi-line description", () => {
    const md = skillMd("name: lint\ndescription: >\n  Lint the code\n  before commit.");
    expect(parseSkill("lint", md).description).toBe("Lint the code before commit.");
  });

  it("accepts CRLF line endings", () => {
    const md = "---\r\nname: lint\r\ndescription: Lint.\r\n---\r\nBody";
    expect(parseSkill("lint", md).name).toBe("lint");
  });

  it("rejects a file without frontmatter", () => {
    expect(() => parseSkill("lint", "# Lint")).toThrow("lint/SKILL.md: missing YAML frontmatter");
  });

  it("rejects a name that breaks the spec", () => {
    expect(() => parseSkill("Lint", skillMd("name: Lint\ndescription: x"))).toThrow(/name:/);
    expect(() => parseSkill("a--b", skillMd("name: a--b\ndescription: x"))).toThrow(/name:/);
    expect(() => parseSkill("-a", skillMd("name: -a\ndescription: x"))).toThrow(/name:/);
    const long = "a".repeat(65);
    expect(() => parseSkill(long, skillMd(`name: ${long}\ndescription: x`))).toThrow(/name:/);
  });

  it("rejects a missing, blank or too long description", () => {
    expect(() => parseSkill("lint", skillMd("name: lint"))).toThrow(/description:/);
    expect(() => parseSkill("lint", skillMd("name: lint\ndescription: '  '"))).toThrow(
      /description:/,
    );
    const long = "x".repeat(1025);
    expect(() => parseSkill("lint", skillMd(`name: lint\ndescription: ${long}`))).toThrow(
      /description:/,
    );
  });

  it("rejects a name that differs from its folder", () => {
    expect(() => parseSkill("lint", skillMd("name: format\ndescription: x"))).toThrow(
      'name "format" must match its folder "lint"',
    );
  });
});

describe("readSkills", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "pigment-skills-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function addSkill(name: string, content = skillMd(`name: ${name}\ndescription: ${name} skill`)) {
    mkdirSync(path.join(dir, name, "references"), { recursive: true });
    writeFileSync(path.join(dir, name, "SKILL.md"), content);
  }

  it("reads every skill folder sorted by name", () => {
    addSkill("zeta");
    addSkill("alpha");
    expect(readSkills(dir)).toEqual([
      { name: "alpha", description: "alpha skill" },
      { name: "zeta", description: "zeta skill" },
    ]);
  });

  it("skips files and folders without SKILL.md", () => {
    addSkill("alpha");
    mkdirSync(path.join(dir, "shared"));
    writeFileSync(path.join(dir, "README.md"), "# Skills");
    expect(readSkills(dir).map((s) => s.name)).toEqual(["alpha"]);
  });

  it("names the broken skill in the error", () => {
    addSkill("alpha", "# no frontmatter");
    expect(() => readSkills(dir)).toThrow(
      "[astro-pigment] Invalid skill alpha/SKILL.md: missing YAML frontmatter",
    );
  });

  it("fails when the directory has no skills", () => {
    expect(() => readSkills(dir)).toThrow("No <name>/SKILL.md folders");
  });

  it("fails when the directory does not exist", () => {
    expect(() => readSkills(path.join(dir, "missing"))).toThrow("agentSkills.directory not found");
  });
});

describe("repoRelativePath", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "pigment-repo-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns the directory's posix path inside its repo", () => {
    execFileSync("git", ["init", "-q"], { cwd: dir });
    const skills = path.join(dir, "packages", "ai", "skills");
    mkdirSync(skills, { recursive: true });
    expect(repoRelativePath(skills)).toBe("packages/ai/skills");
  });

  it("returns an empty path for the repo root", () => {
    execFileSync("git", ["init", "-q"], { cwd: dir });
    expect(repoRelativePath(dir)).toBe("");
  });

  it("returns null outside a git repo", () => {
    expect(repoRelativePath(dir)).toBeNull();
  });
});
