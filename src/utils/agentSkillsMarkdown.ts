import {
  type AgentId,
  type AgentSkillsSource,
  getAgent,
  INSTALL_SCOPES,
  installMethods,
  skillFileUrl,
} from "./agentSkills";
import type { ComponentMarkdown } from "./markdown";
import type { Skill } from "./skills";

export type AgentSkillsConfig = AgentSkillsSource & { agents: AgentId[]; skills: Skill[] };

function inlineCommand(command: string): string {
  return `\`${command.split("\n").join(" && ")}\``;
}

function skillLines(config: AgentSkillsConfig): string[] {
  return config.skills.map(({ name, description }) => {
    const url = skillFileUrl(config, name, "raw");
    return url ? `- [${name}](${url}): ${description}` : `- ${name}: ${description}`;
  });
}

function agentIdList(config: AgentSkillsConfig): string {
  const ids = new Set(config.agents.map((id) => getAgent(id).skillsCli));
  return [...ids].map((id) => `\`${id}\``).join(", ");
}

function singleSkillLine(config: AgentSkillsConfig): string {
  const slug = `${config.owner}/${config.repo}`;
  return (
    `To install one skill, pass its name: \`npx skills add ${slug} --skill <name> -a <agent> -g\` ` +
    `or \`gh skill install ${slug} <name> --agent <agent> --scope user\`. ` +
    "Drop `-g`, or pass `--scope project`, to install into the current project instead."
  );
}

/** `## Agent Skills` section of llms.txt. */
export function agentSkillsLlmsSection(config: AgentSkillsConfig): string {
  const slug = `${config.owner}/${config.repo}`;
  const lines = [
    "## Agent Skills",
    "",
    `This project ships Agent Skills for AI coding agents in the \`${slug}\` GitHub repo. ` +
      `Install all of them with \`npx skills add ${slug} --skill '*' -a <agent> -g\`, ` +
      `where \`<agent>\` is one of ${agentIdList(config)}.`,
  ];
  if (config.plugin) {
    lines.push(
      "",
      `They also ship as the \`${config.plugin.name}@${config.plugin.marketplace}\` plugin: ` +
        `\`npx plugins add ${slug}\` installs it into every detected agent.`,
    );
  }
  lines.push("", singleSkillLine(config), "", ...skillLines(config));
  return lines.join("\n");
}

/**
 * What `<AgentSkillsInstall />` becomes in a page's markdown twin: every command, no tabs.
 * With a `skill`, the commands install that skill alone.
 */
export function agentSkillsInstallMarkdown(
  config: AgentSkillsConfig,
  skill: string | null = null,
): string {
  const agentBlocks = config.agents.flatMap((id) => [
    `- ${getAgent(id).label}`,
    ...INSTALL_SCOPES.flatMap((scope) => [
      `  - ${scope} scope`,
      ...installMethods(id, config, skill, scope).map(
        (m) => `    - ${m.label}: ${inlineCommand(m.command)}`,
      ),
    ]),
  ]);
  const intro =
    skill === null ? "Install every skill for your agent:" : `Install \`${skill}\` for your agent:`;
  return [intro, "", ...agentBlocks].join("\n");
}

/** What `<AgentSkillsIndex />` becomes in a page's markdown twin. */
export function agentSkillsIndexMarkdown(config: AgentSkillsConfig): string {
  return ["## Available Skills", "", singleSkillLine(config), "", ...skillLines(config)].join("\n");
}

/** Markdown twin replacements for `stringifyCleanMarkdown`. */
export function agentSkillsComponents(config: AgentSkillsConfig | null): ComponentMarkdown {
  if (!config) return {};
  return {
    AgentSkillsInstall: ({ skill }) => agentSkillsInstallMarkdown(config, skill ?? null),
    AgentSkillsIndex: () => agentSkillsIndexMarkdown(config),
  };
}
