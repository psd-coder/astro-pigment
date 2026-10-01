import { describe, expect, it } from "vitest";
import {
  AGENT_IDS,
  type AgentSkillsSource,
  INSTALL_SCOPES,
  installMethods,
  resolveInstallMethod,
  skillFileUrl,
} from "./agentSkills";

const source: AgentSkillsSource = {
  owner: "acme",
  repo: "kit",
  skillsPath: "skills",
  plugin: { name: "kit", marketplace: "acme" },
};

const skillsOnly: AgentSkillsSource = { ...source, plugin: null };

function commands(...args: Parameters<typeof installMethods>) {
  return Object.fromEntries(installMethods(...args).map((m) => [m.id, m.command]));
}

describe("installMethods", () => {
  it("leads with plugin installers for an agent with a plugin CLI", () => {
    const methods = installMethods("claude-code", source, null);
    expect(methods.map((m) => m.id)).toEqual([
      "npx-plugins",
      "plugin-cli",
      "npx-skills",
      "gh-skill",
      "curl",
    ]);
    expect(methods[1]).toEqual({
      id: "plugin-cli",
      label: "claude plugin",
      command: "claude plugin marketplace add acme/kit\nclaude plugin install kit@acme",
    });
  });

  it("uses each CLI's own install verb", () => {
    expect(commands("codex", source, null)["plugin-cli"]).toBe(
      "codex plugin marketplace add acme/kit\ncodex plugin add kit@acme",
    );
    expect(commands("github-copilot", source, null)["plugin-cli"]).toBe(
      "copilot plugin marketplace add acme/kit\ncopilot plugin install kit@acme",
    );
  });

  it("offers npx plugins without a plugin CLI where the plugins CLI has a target", () => {
    expect(installMethods("vscode", source, null).map((m) => m.id)).toEqual([
      "npx-plugins",
      "npx-skills",
      "gh-skill",
      "curl",
    ]);
    expect(commands("vscode", source, null)["npx-plugins"]).toBe(
      "npx plugins add acme/kit --target vscode",
    );
  });

  it("drops plugin methods when no plugin is configured", () => {
    expect(installMethods("claude-code", skillsOnly, null).map((m) => m.id)).toEqual([
      "npx-skills",
      "gh-skill",
      "curl",
    ]);
  });

  it("drops plugin methods for a single skill", () => {
    const ids = installMethods("claude-code", source, "lint").map((m) => m.id);
    expect(ids).not.toContain("npx-plugins");
    expect(ids).not.toContain("plugin-cli");
  });

  it("builds install-all and single-skill commands for the skill CLIs", () => {
    expect(commands("cursor", skillsOnly, null)).toMatchObject({
      "npx-skills": "npx skills add acme/kit --skill '*' -a cursor -g",
      "gh-skill": "gh skill install acme/kit --all --agent cursor --scope user",
    });
    expect(commands("cursor", skillsOnly, "lint")).toMatchObject({
      "npx-skills": "npx skills add acme/kit --skill lint -a cursor -g",
      "gh-skill": "gh skill install acme/kit lint --agent cursor --scope user",
    });
  });

  it("targets github-copilot skill dirs for VS Code", () => {
    expect(commands("vscode", skillsOnly, "lint")["npx-skills"]).toContain("-a github-copilot");
  });

  it("extracts the skills folder from the GitHub tarball with curl", () => {
    expect(commands("claude-code", skillsOnly, null).curl).toBe(
      "mkdir -p ~/.claude/skills && curl -fsSL https://codeload.github.com/acme/kit/tar.gz/HEAD | " +
        "tar -xz -C ~/.claude/skills --strip-components=2 kit-HEAD/skills",
    );
    expect(commands("claude-code", skillsOnly, "lint").curl).toBe(
      "mkdir -p ~/.claude/skills/lint && curl -fsSL https://codeload.github.com/acme/kit/tar.gz/HEAD | " +
        "tar -xz -C ~/.claude/skills/lint --strip-components=3 kit-HEAD/skills/lint",
    );
  });

  it("strips nested and root skills paths by their depth", () => {
    const nested = { ...skillsOnly, skillsPath: "packages/ai/skills" };
    expect(commands("codex", nested, "lint").curl).toContain(
      "--strip-components=5 kit-HEAD/packages/ai/skills/lint",
    );
    const root = { ...skillsOnly, skillsPath: "" };
    expect(commands("codex", root, "lint").curl).toContain("--strip-components=2 kit-HEAD/lint");
  });

  it("omits curl when the skills path is unknown", () => {
    const unknown = { ...skillsOnly, skillsPath: null };
    expect(installMethods("claude-code", unknown, null).map((m) => m.id)).not.toContain("curl");
  });

  it("offers pi install for all skills from a root skills folder only", () => {
    expect(installMethods("pi", skillsOnly, null)[0]).toEqual({
      id: "pi-install",
      label: "pi install",
      command: "pi install git:github.com/acme/kit",
    });
    expect(commands("pi", skillsOnly, "lint")["pi-install"]).toBeUndefined();
    expect(commands("pi", { ...skillsOnly, skillsPath: "ai/skills" }, null)["pi-install"]).toBe(
      undefined,
    );
  });

  it("keeps only project-scoped installers at project scope", () => {
    expect(installMethods("claude-code", source, null, "project").map((m) => m.id)).toEqual([
      "plugin-cli",
      "npx-skills",
      "gh-skill",
      "curl",
    ]);
    expect(installMethods("codex", source, null, "project").map((m) => m.id)).toEqual([
      "npx-skills",
      "gh-skill",
      "curl",
    ]);
    expect(installMethods("vscode", source, null, "project").map((m) => m.id)).not.toContain(
      "npx-plugins",
    );
  });

  it("builds project-scope commands", () => {
    expect(commands("claude-code", source, null, "project")).toEqual({
      "plugin-cli":
        "claude plugin marketplace add acme/kit --scope project\n" +
        "claude plugin install kit@acme --scope project",
      "npx-skills": "npx skills add acme/kit --skill '*' -a claude-code",
      "gh-skill": "gh skill install acme/kit --all --agent claude-code --scope project",
      curl:
        "mkdir -p .claude/skills && curl -fsSL https://codeload.github.com/acme/kit/tar.gz/HEAD | " +
        "tar -xz -C .claude/skills --strip-components=2 kit-HEAD/skills",
    });
    expect(commands("cursor", skillsOnly, "lint", "project")).toMatchObject({
      "gh-skill": "gh skill install acme/kit lint --agent cursor --scope project",
      curl: expect.stringContaining("mkdir -p .agents/skills/lint &&"),
    });
    expect(commands("pi", skillsOnly, null, "project")["pi-install"]).toBe(
      "pi install git:github.com/acme/kit -l",
    );
  });

  it("gives every agent at least the two skill CLIs", () => {
    for (const id of AGENT_IDS) {
      for (const scope of INSTALL_SCOPES) {
        const unknown = { ...skillsOnly, skillsPath: null };
        const ids = installMethods(id, unknown, "lint", scope).map((m) => m.id);
        expect(ids).toEqual(expect.arrayContaining(["npx-skills", "gh-skill"]));
      }
    }
  });
});

describe("resolveInstallMethod", () => {
  const methods = installMethods("claude-code", source, null);

  it("keeps the selected method when the agent offers it", () => {
    expect(resolveInstallMethod(methods, "curl").id).toBe("curl");
  });

  it("falls back to the recommended method", () => {
    expect(resolveInstallMethod(methods, "pi-install").id).toBe("npx-plugins");
  });
});

describe("skillFileUrl", () => {
  it("builds raw and blob URLs to a skill's SKILL.md", () => {
    expect(skillFileUrl(source, "lint", "raw")).toBe(
      "https://raw.githubusercontent.com/acme/kit/HEAD/skills/lint/SKILL.md",
    );
    expect(skillFileUrl(source, "lint", "blob")).toBe(
      "https://github.com/acme/kit/blob/HEAD/skills/lint/SKILL.md",
    );
  });

  it("skips an empty repo-root path and returns null for an unknown one", () => {
    expect(skillFileUrl({ ...source, skillsPath: "" }, "lint", "blob")).toBe(
      "https://github.com/acme/kit/blob/HEAD/lint/SKILL.md",
    );
    expect(skillFileUrl({ ...source, skillsPath: null }, "lint", "raw")).toBeNull();
  });
});
