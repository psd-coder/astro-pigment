import type { APIContext } from "astro";
import { afterEach, describe, expect, it, vi } from "vitest";

type Doc = {
  id: string;
  collection: "docs";
  data: { title: string; description: string; order: number };
  body?: string;
};

type Extra = {
  id: string;
  title: string;
  description: string;
  order: number;
  body?: string;
  llms?: boolean;
};

const fx = vi.hoisted(() => ({
  siteConfig: { project: { name: "Pigment", description: "A docs theme." } },
  agentSkills: null as null | {
    owner: string;
    repo: string;
    skillsPath: string | null;
    plugin: null;
    agents: ["claude-code"];
    skills: Array<{ name: string; description: string }>;
  },
  docs: [
    {
      id: "guide",
      collection: "docs",
      data: { title: "Guide", description: "Start here", order: 1 },
      body: "## Setup\n\n### install\n\n## Usage",
    },
  ] as Doc[],
  extraEntries: [
    {
      id: "examples/counter",
      title: "Counter",
      description: "A counter",
      order: 3,
      body: "## Demo",
    },
    { id: "changelog", title: "Changelog", description: "Changes", order: 4, llms: false },
  ] as Extra[],
}));

vi.mock("virtual:pigment-config", () => ({
  siteConfig: fx.siteConfig,
  get agentSkills() {
    return fx.agentSkills;
  },
}));
vi.mock("virtual:pigment-extra-entries", () => ({ extraEntries: fx.extraEntries }));
vi.mock("astro:content", () => ({ getCollection: () => Promise.resolve(fx.docs) }));

const { GET } = await import("./llms.txt");

afterEach(() => {
  fx.agentSkills = null;
});

describe("GET /llms.txt", () => {
  it("renders a markdown index from config, docs, and extra entries", async () => {
    const res = await GET({} as APIContext);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();

    expect(body).toContain("# Pigment");
    expect(body).toContain("A docs theme.");
    expect(body).toContain(
      "- [llms-full.txt](/llms-full.txt): Complete documentation in a single file",
    );
    expect(body).toContain("## Guide");
    expect(body).toContain("- [Guide](/guide.md): Start here");
    expect(body).toContain("  - Setup: install");
    expect(body).toContain("  - Usage");
    expect(body).toContain("## Counter");
    expect(body).toContain("- [Counter](/examples/counter.md): A counter");
  });

  it("omits extra entries flagged llms: false", async () => {
    const body = await (await GET({} as APIContext)).text();
    expect(body).not.toContain("Changelog");
  });

  it("has no agent skills section unless configured", async () => {
    const body = await (await GET({} as APIContext)).text();
    expect(body).not.toContain("## Agent Skills");
  });

  it("lists agent skills right after the llms-full link", async () => {
    fx.agentSkills = {
      owner: "acme",
      repo: "kit",
      skillsPath: "skills",
      plugin: null,
      agents: ["claude-code"],
      skills: [{ name: "lint", description: "Lint the code." }],
    };
    const body = await (await GET({} as APIContext)).text();
    const skills = body.indexOf("## Agent Skills");
    expect(skills).toBeGreaterThan(body.indexOf("llms-full.txt"));
    expect(skills).toBeLessThan(body.indexOf("## Guide"));
    expect(body).toContain(
      "- [lint](https://raw.githubusercontent.com/acme/kit/HEAD/skills/lint/SKILL.md): Lint the code.",
    );
  });
});
