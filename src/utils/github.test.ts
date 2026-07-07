import { describe, expect, it } from "vitest";
import type { SiteConfig } from "../types";
import { getGithubUrl } from "./github";

type GithubConfig = SiteConfig["project"]["github"];

describe("getGithubUrl", () => {
  it("uses user as owner when present", () => {
    const github = { user: "psd-coder", repository: "astro-pigment" } satisfies GithubConfig;
    expect(getGithubUrl(github)).toBe("https://github.com/psd-coder/astro-pigment");
  });

  it("falls back to organization when user is absent", () => {
    const github = { organization: "acme", repository: "widgets" } satisfies GithubConfig;
    expect(getGithubUrl(github)).toBe("https://github.com/acme/widgets");
  });

  it("prefers user over organization when both are set", () => {
    const github = {
      user: "alice",
      organization: "acme",
      repository: "widgets",
    } satisfies GithubConfig;
    expect(getGithubUrl(github)).toBe("https://github.com/alice/widgets");
  });

  it("yields an empty owner when neither user nor organization is set", () => {
    const github = { repository: "widgets" } satisfies GithubConfig;
    expect(getGithubUrl(github)).toBe("https://github.com//widgets");
  });
});
