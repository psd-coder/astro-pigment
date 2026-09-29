import { persistentAtom } from "@nanostores/persistent";

// Plain strings: the saved value may name an agent or method a site no longer offers,
// so readers resolve it against what is configured.
export const $skillsAgent = persistentAtom<string>("skills-agent", "");
export const $skillsInstallMethod = persistentAtom<string>("skills-install-method", "");
