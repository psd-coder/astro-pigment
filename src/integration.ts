import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcssPresetEnv from "postcss-preset-env";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { adaptiveCodeTheme } from "./themes/adaptive-code-theme";
import type { DocsThemeConfig, SiteConfig } from "./types";
import { fonts } from "./utils/fonts";
import { deriveBase, deriveGitHubPagesSite, getGithubUrl } from "./utils/github";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIRTUAL_MODULE_ID = "virtual:theme-integration-config";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

function validateAuthor(author: DocsThemeConfig["author"]): void {
  if (!author) return;
  if (author.url.includes("x.com")) return;
  if (!author.icon) {
    throw new Error(
      `[astro-pigment] author.icon is required when author.url is not an x.com URL. ` +
        `Got author.url="${author.url}". Provide raw SVG markup for author.icon.`,
    );
  }
}

function extractSiteConfig(config: DocsThemeConfig): SiteConfig {
  return {
    project: config.project,
    author: config.author,
    credits: config.credits,
  };
}

function readSvg(filePath: string): string {
  return readFileSync(path.resolve(filePath), "utf-8");
}

export function createIntegration(config: DocsThemeConfig): AstroIntegration {
  validateAuthor(config.author);
  const githubUrl = getGithubUrl(config.project.github);
  const rawSiteConfig = extractSiteConfig(config);
  const siteConfig: SiteConfig = {
    ...rawSiteConfig,
    author: rawSiteConfig.author
      ? {
          ...rawSiteConfig.author,
          ...(rawSiteConfig.author.icon && { icon: readSvg(rawSiteConfig.author.icon) }),
        }
      : undefined,
  };
  const docsConfig = {
    directory: config.docs?.directory ?? "src/content/docs",
    deepSections: config.docs?.deepSections ?? [],
  };
  const renderDefaultPage = config.docs?.renderDefaultPage ?? true;
  const tocItemsSelector = config.docs?.tocItemsSelector ?? ".prose :is(h2, h3)[id]";
  const navLinks = config.navLinks ?? [];
  const shikiConfig = config.shikiThemes
    ? { themes: config.shikiThemes }
    : { theme: adaptiveCodeTheme };

  const faviconSource = typeof config.icon === "string" ? config.icon : config.icon?.favicon;
  const manifestIconSource = typeof config.icon === "string" ? config.icon : config.icon?.manifest;
  const faviconPath = faviconSource ? path.resolve(faviconSource) : null;
  const manifestIconPath = manifestIconSource ? path.resolve(manifestIconSource) : null;
  const hasIcon = faviconPath !== null || manifestIconPath !== null;

  const huePicker = config.huePicker ?? false;
  const clientRouter = config.clientRouter ?? true;
  const search = config.search ?? true;
  const logo = config.logo ? readSvg(config.logo) : null;
  const lang = config.meta?.lang ?? "en";
  const titleSuffix =
    config.meta?.titleSuffix !== undefined ? config.meta.titleSuffix : siteConfig.project.name;
  const mainPageTitle = config.meta?.mainPageTitle ?? `${siteConfig.project.name} Documentation`;

  const virtualModuleCode = `
export const siteConfig = ${JSON.stringify(siteConfig)};
export const githubUrl = ${JSON.stringify(githubUrl)};
export const docsConfig = ${JSON.stringify(docsConfig)};
export const faviconPath = ${JSON.stringify(faviconPath)};
export const manifestIconPath = ${JSON.stringify(manifestIconPath)};
export const huePicker = ${JSON.stringify(huePicker)};
export const clientRouter = ${JSON.stringify(clientRouter)};
export const search = ${JSON.stringify(search)};
export const navLinks = ${JSON.stringify(navLinks)};
export const tocItemsSelector = ${JSON.stringify(tocItemsSelector)};
export const logo = ${JSON.stringify(logo)};
export const lang = ${JSON.stringify(lang)};
export const titleSuffix = ${JSON.stringify(titleSuffix)};
export const mainPageTitle = ${JSON.stringify(mainPageTitle)};
`;

  return {
    name: "astro-pigment",
    hooks: {
      "astro:config:setup": ({ config: astroConfig, updateConfig, injectRoute, injectScript }) => {
        const site = config.site ?? deriveGitHubPagesSite(config.project.github);
        const base = config.site ? "/" : deriveBase(config.project.github);

        const integrations: AstroIntegration[] = [];

        if (!astroConfig.integrations.some((i) => i.name === "@astrojs/mdx")) {
          integrations.push(mdx());
        }

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

        for (const cssPath of config.customCss ?? []) {
          const resolved = path.resolve(fileURLToPath(astroConfig.root), cssPath);
          injectScript("page-ssr", `import ${JSON.stringify(resolved)};`);
        }

        if (renderDefaultPage) {
          injectRoute({
            pattern: "/[...slug]",
            entrypoint: path.resolve(__dirname, "pages/[...slug].astro"),
          });
        }

        if (search) {
          injectRoute({
            pattern: "/search-index.json",
            entrypoint: path.resolve(__dirname, "pages/search-index.json.ts"),
          });
        }

        if (hasIcon) {
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
          ...(config.fonts !== false && { fonts: fonts() }),
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
