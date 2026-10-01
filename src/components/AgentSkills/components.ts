import { define } from "nanotags";
import { computed } from "nanostores";
import { agentSkills } from "virtual:pigment-config";
import { $skillsAgent, $skillsInstallMethod, $skillsScope } from "../../stores/agentSkills";
import { INSTALL_SCOPES, installMethods, resolveInstallMethod } from "../../utils/agentSkills";

type TabsElement = HTMLElement & { value: string | null };

// The element renders only when `agentSkills` is configured, so null never reaches an effect.
const source = agentSkills;

const $agent = computed($skillsAgent, (saved) =>
  source ? (source.agents.find((id) => id === saved) ?? source.agents[0]) : undefined,
);

const $scope = computed(
  $skillsScope,
  (saved) => INSTALL_SCOPES.find((scope) => scope === saved) ?? "user",
);

// Every panel on the page shares the saved agent, scope and method. A panel that lacks the saved
// method (a single skill or project scope has no `npx plugins`) shows its recommended one instead.
define("x-agent-skills-install")
  .withProps((p) => ({
    skill: p.string(null),
  }))
  .withRefs((r) => ({
    agentSelect: r.one("select"),
    scopeSelect: r.one("select"),
    methodTabs: r.many<TabsElement>("x-tabs"),
    commands: r.many("div"),
  }))
  .setup((ctx) => {
    const { agentSelect, scopeSelect, methodTabs, commands } = ctx.refs;

    const $method = computed(
      [$agent, $scope, $skillsInstallMethod, ctx.props.$skill],
      (agent, scope, selected, skill) =>
        source && agent
          ? resolveInstallMethod(installMethods(agent, source, skill, scope), selected)
          : undefined,
    );

    ctx.on(agentSelect, "change", () => $skillsAgent.set(agentSelect.value));
    ctx.on(scopeSelect, "change", () => $skillsScope.set(scopeSelect.value));
    ctx.on(methodTabs, "change", (e) => $skillsInstallMethod.set(e.currentTarget.value ?? ""));

    ctx.effect([$agent, $scope, $method], (agent, scope, method) => {
      if (!agent || !method) return;
      agentSelect.value = agent;
      scopeSelect.value = scope;
      const shown = (el: HTMLElement) => el.dataset.agent === agent && el.dataset.scope === scope;
      methodTabs.forEach((tabs) => {
        const active = shown(tabs);
        tabs.hidden = !active;
        if (active) tabs.setAttribute("value", method.id);
      });
      commands.forEach((panel) => {
        panel.hidden = !shown(panel) || panel.dataset.method !== method.id;
      });
    });
  });
