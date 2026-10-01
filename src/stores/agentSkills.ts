import { persistentAtom } from "@nanostores/persistent";

// Plain strings: the saved value may name an agent, scope or method a site no longer offers,
// so readers resolve it against what is configured.
export const $skillsAgent = persistentAtom<string>("skills-agent", "");
export const $skillsScope = persistentAtom<string>("skills-scope", "");
export const $skillsInstallMethod = persistentAtom<string>("skills-install-method", "");
