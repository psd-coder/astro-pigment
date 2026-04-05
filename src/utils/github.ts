import type { SiteConfig } from "../types";

export function getGithubOwner(github: SiteConfig["github"]): string {
  return github.user ?? github.organization ?? "";
}

export function getGithubUrl(github: SiteConfig["github"]): string {
  return `https://github.com/${getGithubOwner(github)}/${github.repository}`;
}

export function deriveGitHubPagesSite(github: SiteConfig["github"]): string {
  const owner = getGithubOwner(github);
  return `https://${owner}.github.io`;
}

export function deriveBase(github: SiteConfig["github"]): string {
  return process.env.CI ? `/${github.repository}/` : "/";
}
