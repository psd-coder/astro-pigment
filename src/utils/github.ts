import type { SiteConfig } from "../types";

type GithubConfig = SiteConfig["project"]["github"];

export function getGithubOwner(github: GithubConfig): string {
  return github.user ?? github.organization ?? "";
}

export function getGithubUrl(github: GithubConfig): string {
  return `https://github.com/${getGithubOwner(github)}/${github.repository}`;
}

export function deriveBase(github: GithubConfig): string {
  return process.env.CI ? `/${github.repository}/` : "/";
}
