import { describe, expect, it } from "vitest";
import {
  type AgentSkillsConfig,
  agentSkillsComponents,
  agentSkillsIndexMarkdown,
  agentSkillsInstallMarkdown,
  agentSkillsLlmsSection,
} from "./agentSkillsMarkdown";

const config: AgentSkillsConfig = {
  owner: "acme",
  repo: "kit",
  skillsPath: "skills",
  plugin: null,
  agents: ["claude-code", "github-copilot", "vscode"],
  skills: [
    { name: "format", description: "Format the code." },
    { name: "lint", description: "Lint the code." },
  ],
};

describe("agentSkillsLlmsSection", () => {
  it("lists the install command and each skill linked to its raw SKILL.md", () => {
    expect(agentSkillsLlmsSection(config)).toBe(
      [
        "## Agent Skills",
        "",
        "This project ships Agent Skills for AI coding agents in the `acme/kit` GitHub repo. " +
          "Install all of them with `npx skills add acme/kit --skill '*' -a <agent> -g`, " +
          "where `<agent>` is one of `claude-code`, `github-copilot`.",
        "",
        "To install one skill, pass its name: `npx skills add acme/kit --skill <name> -a <agent> -g` " +
          "or `gh skill install acme/kit <name> --agent <agent> --scope user`. " +
          "Drop `-g`, or pass `--scope project`, to install into the current project instead.",
        "",
        "- [format](https://raw.githubusercontent.com/acme/kit/HEAD/skills/format/SKILL.md): Format the code.",
        "- [lint](https://raw.githubusercontent.com/acme/kit/HEAD/skills/lint/SKILL.md): Lint the code.",
      ].join("\n"),
    );
  });

  it("mentions the plugin when one is configured", () => {
    const section = agentSkillsLlmsSection({
      ...config,
      plugin: { name: "kit", marketplace: "acme" },
    });
    expect(section).toContain(
      "They also ship as the `kit@acme` plugin: `npx plugins add acme/kit` installs it into every detected agent.",
    );
  });

  it("lists skills without links when the repo path is unknown", () => {
    const section = agentSkillsLlmsSection({ ...config, skillsPath: null });
    expect(section).toContain("- lint: Lint the code.");
    expect(section).not.toContain("raw.githubusercontent.com");
  });

  it("links skills at the repo root without an empty segment", () => {
    const section = agentSkillsLlmsSection({ ...config, skillsPath: "" });
    expect(section).toContain("(https://raw.githubusercontent.com/acme/kit/HEAD/lint/SKILL.md)");
  });
});

describe("agentSkillsInstallMarkdown", () => {
  it("lists every method per configured agent and scope", () => {
    const md = agentSkillsInstallMarkdown({
      ...config,
      plugin: { name: "kit", marketplace: "acme" },
    });
    expect(md).toContain(
      [
        "Install every skill for your agent:",
        "",
        "- Claude Code",
        "  - user scope",
        "    - npx plugins: `npx plugins add acme/kit --target claude-code`",
        "    - claude plugin: `claude plugin marketplace add acme/kit && claude plugin install kit@acme`",
        "    - npx skills: `npx skills add acme/kit --skill '*' -a claude-code -g`",
        "    - gh skill: `gh skill install acme/kit --all --agent claude-code --scope user`",
      ].join("\n"),
    );
    expect(md).toContain(
      [
        "  - project scope",
        "    - claude plugin: `claude plugin marketplace add acme/kit --scope project && " +
          "claude plugin install kit@acme --scope project`",
        "    - npx skills: `npx skills add acme/kit --skill '*' -a claude-code`",
      ].join("\n"),
    );
    expect(md).toContain(
      "- VS Code\n  - user scope\n    - npx plugins: `npx plugins add acme/kit --target vscode`",
    );
    expect(md).not.toContain("- Codex");
    expect(md).not.toContain("Lint the code.");
  });
});

describe("agentSkillsInstallMarkdown for one skill", () => {
  it("lists that skill's commands without plugin installers", () => {
    const md = agentSkillsInstallMarkdown(
      { ...config, plugin: { name: "kit", marketplace: "acme" } },
      "lint",
    );
    expect(md).toContain("Install `lint` for your agent:");
    expect(md).toContain(
      "    - npx skills: `npx skills add acme/kit --skill lint -a claude-code -g`",
    );
    expect(md).not.toContain("npx plugins");
  });
});

describe("agentSkillsIndexMarkdown", () => {
  it("gives a heading, the single-skill hint, then every skill", () => {
    const md = agentSkillsIndexMarkdown(config);
    expect(md.startsWith("## Available Skills\n\nTo install one skill, pass its name:")).toBe(true);
    expect(md.endsWith("/skills/lint/SKILL.md): Lint the code.")).toBe(true);
    expect(md).not.toContain("Install every skill");
  });
});

describe("agentSkillsComponents", () => {
  it("renders both components, passing the install panel's skill prop through", () => {
    const components = agentSkillsComponents(config);
    expect(components.AgentSkillsInstall?.({})).toBe(agentSkillsInstallMarkdown(config));
    expect(components.AgentSkillsInstall?.({ skill: "lint" })).toBe(
      agentSkillsInstallMarkdown(config, "lint"),
    );
    expect(components.AgentSkillsIndex?.({})).toBe(agentSkillsIndexMarkdown(config));
  });

  it("maps nothing when agent skills are not configured", () => {
    expect(agentSkillsComponents(null)).toEqual({});
  });
});
