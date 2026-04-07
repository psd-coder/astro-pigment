import { fileURLToPath } from "node:url";
import path from "node:path";
import type { AstroIntegration } from "astro";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import postcssPresetEnv from "postcss-preset-env";
import sitemap from "@astrojs/sitemap";
import type { DocsThemeConfig, SiteConfig } from "./types";
import { deriveBase, deriveGitHubPagesSite, getGithubUrl } from "./utils/github";
import { adaptiveCodeTheme } from "./themes/adaptive-code-theme";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIRTUAL_MODULE_ID = "virtual:theme-integration-config";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

function extractSiteConfig(config: DocsThemeConfig): SiteConfig {
  return {
    github: config.github,
    project: config.project,
    author: config.author,
    credits: config.credits,
  };
}

export function createIntegration(config: DocsThemeConfig): AstroIntegration {
  const githubUrl = getGithubUrl(config.github);
  const siteConfig = extractSiteConfig(config);
  const docsConfig = config.docs
    ? {
        directory: config.docs.directory,
        pattern: config.docs.pattern ?? "**/*.{md,mdx}",
        deepSections: config.docs.deepSections ?? [],
      }
    : null;
  const shikiConfig = config.shikiThemes
    ? { themes: config.shikiThemes }
    : { theme: adaptiveCodeTheme };

  const iconPath = config.icon ? path.resolve(config.icon) : null;

  const hueSlider = config.hueSlider ?? false;
  const clientRouter = config.clientRouter ?? true;

  const virtualModuleCode = `
export const siteConfig = ${JSON.stringify(siteConfig)};
export const githubUrl = ${JSON.stringify(githubUrl)};
export const docsConfig = ${JSON.stringify(docsConfig)};
export const iconPath = ${JSON.stringify(iconPath)};
export const hueSlider = ${JSON.stringify(hueSlider)};
export const clientRouter = ${JSON.stringify(clientRouter)};
`;

  return {
    name: "@psd-coder/astro-docs-theme",
    hooks: {
      "astro:config:setup": ({ config: astroConfig, updateConfig, injectRoute }) => {
        const site = config.site ?? deriveGitHubPagesSite(config.github);
        const base = config.site ? "/" : deriveBase(config.github);

        const integrations: AstroIntegration[] = [];

        if (docsConfig) {
          integrations.push(sitemap());

          injectRoute({
            pattern: "/llms.txt",
            entrypoint: path.resolve(__dirname, "pages/llms.txt.ts"),
          });
          injectRoute({
            pattern: "/llms-full.txt",
            entrypoint: path.resolve(__dirname, "pages/llms-full.txt.ts"),
          });
          injectRoute({
            pattern: "/[...slug].md",
            entrypoint: path.resolve(__dirname, "pages/[...slug].md.ts"),
          });
        }

        if (iconPath) {
          injectRoute({
            pattern: "/site.webmanifest",
            entrypoint: path.resolve(__dirname, "pages/site.webmanifest.ts"),
          });
          injectRoute({
            pattern: "/favicon-96x96.png",
            entrypoint: path.resolve(__dirname, "pages/favicon-96x96.png.ts"),
          });
          injectRoute({
            pattern: "/apple-touch-icon.png",
            entrypoint: path.resolve(__dirname, "pages/apple-touch-icon.png.ts"),
          });
          injectRoute({
            pattern: "/web-app-manifest-192x192.png",
            entrypoint: path.resolve(__dirname, "pages/web-app-manifest-192x192.png.ts"),
          });
          injectRoute({
            pattern: "/web-app-manifest-512x512.png",
            entrypoint: path.resolve(__dirname, "pages/web-app-manifest-512x512.png.ts"),
          });
          injectRoute({
            pattern: "/favicon.svg",
            entrypoint: path.resolve(__dirname, "pages/favicon.svg.ts"),
          });
          injectRoute({
            pattern: "/favicon.ico",
            entrypoint: path.resolve(__dirname, "pages/favicon.ico.ts"),
          });
        }

        updateConfig({
          site: astroConfig.site ?? site,
          base: astroConfig.base !== "/" ? astroConfig.base : base,
          integrations,
          markdown: {
            shikiConfig,
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "prepend",
                  properties: { className: ["anchor"], ariaHidden: true, tabIndex: -1 },
                  content: [],
                },
              ],
            ],
          },
          vite: {
            css: {
              postcss: {
                plugins: [
                  postcssPresetEnv({
                    stage: 3,
                    features: {
                      "nesting-rules": true,
                      "custom-media-queries": true,
                      "media-query-ranges": true,
                    },
                  }),
                ],
              },
            },
            plugins: [
              {
                name: "docs-theme-virtual-config",
                resolveId(id: string) {
                  if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
                  return undefined;
                },
                load(id: string) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) return virtualModuleCode;
                  return undefined;
                },
              },
            ],
          },
        });
      },
    },
  };
}
