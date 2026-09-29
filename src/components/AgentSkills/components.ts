import { define } from "nanotags";
import { computed } from "nanostores";
import { agentSkills } from "virtual:pigment-config";
import { $skillsAgent, $skillsInstallMethod } from "../../stores/agentSkills";
import { installMethods, resolveInstallMethod } from "../../utils/agentSkills";

type TabsElement = HTMLElement & { value: string | null };

// The element renders only when `agentSkills` is configured, so null never reaches an effect.
const source = agentSkills;

const $agent = computed($skillsAgent, (saved) =>
  source ? (source.agents.find((id) => id === saved) ?? source.agents[0]) : undefined,
);

// Every panel on the page shares the saved agent and method. A panel that lacks the saved
// method (a single skill has no plugin installers) shows its recommended one instead.
define("x-agent-skills-install")
  .withProps((p) => ({
    skill: p.string(null),
  }))
  .withRefs((r) => ({
    agentSelect: r.one("select"),
    methodTabs: r.many<TabsElement>("x-tabs"),
    commands: r.many("div"),
  }))
  .setup((ctx) => {
    const { agentSelect, methodTabs, commands } = ctx.refs;

    const $method = computed(
      [$agent, $skillsInstallMethod, ctx.props.$skill],
      (agent, selected, skill) =>
        source && agent
          ? resolveInstallMethod(installMethods(agent, source, skill), selected)
          : undefined,
    );

    ctx.on(agentSelect, "change", () => $skillsAgent.set(agentSelect.value));
    ctx.on(methodTabs, "change", (e) => $skillsInstallMethod.set(e.currentTarget.value ?? ""));

    ctx.effect([$agent, $method], (agent, method) => {
      if (!agent || !method) return;
      agentSelect.value = agent;
      methodTabs.forEach((tabs) => {
        const active = tabs.dataset.agent === agent;
        tabs.hidden = !active;
        if (active) tabs.setAttribute("value", method.id);
      });
      commands.forEach((panel) => {
        panel.hidden = panel.dataset.agent !== agent || panel.dataset.method !== method.id;
      });
    });
  });
