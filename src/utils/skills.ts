import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import * as v from "valibot";
import { parse as parseYaml } from "yaml";

export type Skill = { name: string; description: string };

// https://agentskills.io/specification#frontmatter
const skillSchema = v.object({
  name: v.pipe(
    v.string(),
    v.maxLength(64),
    v.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, digits and single hyphens"),
  ),
  description: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(1024)),
});

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function parseSkill(dirName: string, content: string): Skill {
  const match = FRONTMATTER.exec(content);
  if (!match) throw new Error(`${dirName}/SKILL.md: missing YAML frontmatter`);

  const result = v.safeParse(skillSchema, parseYaml(match[1] ?? ""));
  if (!result.success) {
    const issues = result.issues.map((i) => `${v.getDotPath(i) ?? "frontmatter"}: ${i.message}`);
    throw new Error(`${dirName}/SKILL.md: ${issues.join("; ")}`);
  }
  if (result.output.name !== dirName) {
    throw new Error(
      `${dirName}/SKILL.md: name "${result.output.name}" must match its folder "${dirName}"`,
    );
  }
  return { name: result.output.name, description: result.output.description };
}

export function readSkills(directory: string): Skill[] {
  if (!existsSync(directory)) {
    throw new Error(`[astro-pigment] agentSkills.directory not found: ${directory}`);
  }

  const skills = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(path.join(directory, entry.name, "SKILL.md")))
    .map((entry) => {
      const content = readFileSync(path.join(directory, entry.name, "SKILL.md"), "utf-8");
      try {
        return parseSkill(entry.name, content);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        throw new Error(`[astro-pigment] Invalid skill ${error.message}`, { cause: error });
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (skills.length === 0) {
    throw new Error(`[astro-pigment] No <name>/SKILL.md folders in ${directory}`);
  }
  return skills;
}

/** The directory's path inside its git repo, posix. null outside a repo or without git. */
export function repoRelativePath(directory: string): string | null {
  let root: string;
  try {
    root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: directory,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
  // git prints the resolved root, so compare against the resolved directory
  const relative = path.relative(root, realpathSync(directory));
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return relative.split(path.sep).join("/");
}
