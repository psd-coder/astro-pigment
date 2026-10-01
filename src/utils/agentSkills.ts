// Agent ids, target flags and skill dirs come from each vendor's docs, the `skills` CLI agent
// table, `gh skill install --help` and the `plugins` CLI targets.
// See docs/research/agent-skills-discovery.md.
export const AGENTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    skillsCli: "claude-code",
    dirs: { user: "~/.claude/skills", project: ".claude/skills" },
    pluginsTarget: "claude-code",
    pluginCli: { bin: "claude", install: "install", projectScope: true },
  },
  {
    id: "codex",
    label: "Codex",
    skillsCli: "codex",
    dirs: { user: "~/.agents/skills", project: ".agents/skills" },
    pluginsTarget: "codex",
    pluginCli: { bin: "codex", install: "add" },
  },
  {
    id: "cursor",
    label: "Cursor",
    skillsCli: "cursor",
    dirs: { user: "~/.cursor/skills", project: ".agents/skills" },
    pluginsTarget: "cursor",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    skillsCli: "github-copilot",
    dirs: { user: "~/.copilot/skills", project: ".agents/skills" },
    pluginsTarget: "github-copilot",
    pluginCli: { bin: "copilot", install: "install" },
  },
  // VS Code reads the Copilot skill dirs, so skill installers target github-copilot.
  {
    id: "vscode",
    label: "VS Code",
    skillsCli: "github-copilot",
    dirs: { user: "~/.copilot/skills", project: ".agents/skills" },
    pluginsTarget: "vscode",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    skillsCli: "gemini-cli",
    dirs: { user: "~/.gemini/skills", project: ".agents/skills" },
  },
  {
    id: "opencode",
    label: "OpenCode",
    skillsCli: "opencode",
    dirs: { user: "~/.config/opencode/skills", project: ".agents/skills" },
  },
  {
    id: "grok",
    label: "Grok Build",
    skillsCli: "grok",
    dirs: { user: "~/.grok/skills", project: ".grok/skills" },
    pluginsTarget: "grok",
  },
  {
    id: "pi",
    label: "Pi",
    skillsCli: "pi",
    dirs: { user: "~/.agents/skills", project: ".pi/skills" },
    piPackage: true,
  },
] as const;

type Agent = (typeof AGENTS)[number];
export type AgentId = Agent["id"];

export const AGENT_IDS = AGENTS.map((a) => a.id);

export const INSTALL_METHODS = [
  "npx-plugins",
  "plugin-cli",
  "pi-install",
  "npx-skills",
  "gh-skill",
  "curl",
] as const;

export type InstallMethodId = (typeof INSTALL_METHODS)[number];

export const INSTALL_SCOPES = ["user", "project"] as const;

export type InstallScope = (typeof INSTALL_SCOPES)[number];

export type AgentSkillsSource = {
  owner: string;
  repo: string;
  /** Skills folder inside the repo, posix, "" for the repo root. null when unknown. */
  skillsPath: string | null;
  plugin: { name: string; marketplace: string } | null;
};

/** `null` installs every skill. */
export type InstallSkill = string | null;

export type InstallMethod = { id: InstallMethodId; label: string; command: string };

export function getAgent(id: AgentId): Agent {
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) throw new Error(`[astro-pigment] Unknown agent "${id}"`);
  return agent;
}

function curlCommand(
  agent: Agent,
  source: AgentSkillsSource,
  skill: InstallSkill,
  scope: InstallScope,
): string | null {
  if (source.skillsPath === null) return null;
  const member = [`${source.repo}-HEAD`, ...source.skillsPath.split("/").filter(Boolean)];
  if (skill !== null) member.push(skill);
  const root = agent.dirs[scope];
  const dir = skill === null ? root : `${root}/${skill}`;
  const tarball = `https://codeload.github.com/${source.owner}/${source.repo}/tar.gz/HEAD`;
  return (
    `mkdir -p ${dir} && curl -fsSL ${tarball} | ` +
    `tar -xz -C ${dir} --strip-components=${member.length} ${member.join("/")}`
  );
}

// A Pi package picks up a conventional `skills/` dir at the repo root, and installs whole.
function piInstallCommand(
  agent: Agent,
  source: AgentSkillsSource,
  skill: InstallSkill,
  scope: InstallScope,
): InstallMethod | null {
  if (!("piPackage" in agent) || skill !== null || source.skillsPath !== "skills") return null;
  const local = scope === "project" ? " -l" : "";
  return {
    id: "pi-install",
    label: "pi install",
    command: `pi install git:github.com/${source.owner}/${source.repo}${local}`,
  };
}

/** Install methods for one agent, recommended first. */
export function installMethods(
  agentId: AgentId,
  source: AgentSkillsSource,
  skill: InstallSkill,
  scope: InstallScope = "user",
): InstallMethod[] {
  const agent = getAgent(agentId);
  const slug = `${source.owner}/${source.repo}`;
  const methods: InstallMethod[] = [];

  if (source.plugin && skill === null) {
    // `npx plugins` writes user config for every target, whatever its --scope.
    if ("pluginsTarget" in agent && scope === "user") {
      methods.push({
        id: "npx-plugins",
        label: "npx plugins",
        command: `npx plugins add ${slug} --target ${agent.pluginsTarget}`,
      });
    }
    if ("pluginCli" in agent && (scope === "user" || "projectScope" in agent.pluginCli)) {
      const { bin, install } = agent.pluginCli;
      const { name, marketplace } = source.plugin;
      const flag = scope === "project" ? " --scope project" : "";
      methods.push({
        id: "plugin-cli",
        label: `${bin} plugin`,
        command:
          `${bin} plugin marketplace add ${slug}${flag}\n` +
          `${bin} plugin ${install} ${name}@${marketplace}${flag}`,
      });
    }
  }

  const piInstall = piInstallCommand(agent, source, skill, scope);
  if (piInstall) methods.push(piInstall);

  methods.push(
    {
      id: "npx-skills",
      label: "npx skills",
      command:
        `npx skills add ${slug} --skill ${skill ?? "'*'"} -a ${agent.skillsCli}` +
        (scope === "user" ? " -g" : ""),
    },
    {
      id: "gh-skill",
      label: "gh skill",
      command:
        skill === null
          ? `gh skill install ${slug} --all --agent ${agent.skillsCli} --scope ${scope}`
          : `gh skill install ${slug} ${skill} --agent ${agent.skillsCli} --scope ${scope}`,
    },
  );

  const curl = curlCommand(agent, source, skill, scope);
  if (curl) methods.push({ id: "curl", label: "curl", command: curl });

  return methods;
}

/** The selected method when this agent offers it, otherwise its recommended one. */
export function resolveInstallMethod(methods: InstallMethod[], selected: string): InstallMethod {
  const method = methods.find((m) => m.id === selected) ?? methods[0];
  if (!method) throw new Error("[astro-pigment] An agent always has at least one install method");
  return method;
}

/** A skill's SKILL.md on GitHub: `raw` for agents, `blob` for people. null when the path is unknown. */
export function skillFileUrl(
  source: AgentSkillsSource,
  name: string,
  view: "raw" | "blob",
): string | null {
  if (source.skillsPath === null) return null;
  const base =
    view === "raw"
      ? `https://raw.githubusercontent.com/${source.owner}/${source.repo}/HEAD`
      : `https://github.com/${source.owner}/${source.repo}/blob/HEAD`;
  return [base, source.skillsPath, name, "SKILL.md"].filter(Boolean).join("/");
}
