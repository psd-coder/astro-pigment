import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcssPresetEnv from "postcss-preset-env";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { adaptiveCodeTheme } from "./themes/adaptive-code-theme";
import type { DocsThemeConfig, SiteConfig } from "./types";
import { generateScopedName, transitiveCssPlugin } from "./utils/cssModules";
import { fonts } from "./utils/fonts";
import { deriveBase, deriveGitHubPagesSite, getGithubUrl } from "./utils/github";
import { isGenerated, resolveImageSource } from "./utils/ogResolve";
import { deriveTwitterCreator } from "./utils/twitter";
import { buildConfigModule, virtualReexportDefault } from "./utils/virtualModules";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIRTUAL_MODULE_ID = "virtual:pigment-config";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const VIRTUAL_EXTRA_ENTRIES_ID = "virtual:pigment-extra-entries";
const RESOLVED_VIRTUAL_EXTRA_ENTRIES_ID = `\0${VIRTUAL_EXTRA_ENTRIES_ID}`;
const VIRTUAL_OG_TEMPLATE_ID = "virtual:pigment-og-template";
const RESOLVED_VIRTUAL_OG_TEMPLATE_ID = `\0${VIRTUAL_OG_TEMPLATE_ID}`;
const VIRTUAL_TWITTER_TEMPLATE_ID = "virtual:pigment-twitter-template";
const RESOLVED_VIRTUAL_TWITTER_TEMPLATE_ID = `\0${VIRTUAL_TWITTER_TEMPLATE_ID}`;

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
          ...(rawSiteConfig.author.icon && {
            icon: readSvg(rawSiteConfig.author.icon),
          }),
        }
      : undefined,
  };
  const docsConfig = {
    directory: config.docs?.directory ?? "src/content/docs",
  };
  const renderDefaultPage = config.docs?.renderDefaultPage ?? true;
  const navLinks = config.docs?.navLinks ?? [];
  const shikiConfig = config.theme?.shiki
    ? { themes: config.theme.shiki }
    : { theme: adaptiveCodeTheme };

  const iconConfig = config.meta?.icon;
  const faviconSource = typeof iconConfig === "string" ? iconConfig : iconConfig?.favicon;
  const manifestIconSource = typeof iconConfig === "string" ? iconConfig : iconConfig?.manifest;
  const faviconPath = faviconSource ? path.resolve(faviconSource) : null;
  const manifestIconPath = manifestIconSource ? path.resolve(manifestIconSource) : null;
  const hasIcon = faviconPath !== null || manifestIconPath !== null;

  if (hasIcon) {
    try {
      createRequire(import.meta.url).resolve("sharp");
    } catch {
      throw new Error(
        `[astro-pigment] The "meta.icon" option requires the "sharp" package. ` +
          `Install it in your project: npm install sharp (or pnpm add sharp)`,
      );
    }
  }

  const ogFontPaths = {
    sansRegular: path.resolve(__dirname, "assets/fonts/MartianGrotesk-StdRg.ttf"),
    sansBold: path.resolve(__dirname, "assets/fonts/MartianGrotesk-StdBd.ttf"),
    mono: path.resolve(__dirname, "assets/fonts/MartianMono-Regular.ttf"),
  };
  const huePicker = config.huePicker ?? false;
  const clientRouter = config.clientRouter ?? true;
  const search = config.search ?? true;
  const logo = config.logo ? readSvg(config.logo) : null;
  const themeHue = config.theme?.hue ?? 180;
  const publicSiteUrl =
    config.site ??
    `${deriveGitHubPagesSite(config.project.github)}/${config.project.github.repository}`;
  const lang = config.meta?.lang ?? "en";
  const titleSuffix =
    config.meta?.titleSuffix !== undefined ? config.meta.titleSuffix : siteConfig.project.name;
  const mainPageTitle = config.meta?.mainPageTitle ?? `${siteConfig.project.name} documentation`;
  const ogImageAlt = config.meta?.og?.imageAlt ?? siteConfig.project.description;
  const twitterImageAlt = config.meta?.twitter?.imageAlt ?? ogImageAlt;
  const twitterSite = config.meta?.twitter?.site ?? null;
  const twitterCreator = deriveTwitterCreator(config.meta?.twitter?.creator, siteConfig.author);

  return {
    name: "astro-pigment",
    hooks: {
      "astro:config:setup": ({ config: astroConfig, updateConfig, injectRoute, injectScript }) => {
        const site = config.site ?? deriveGitHubPagesSite(config.project.github);
        const base = config.site ? "/" : deriveBase(config.project.github);
        const astroRoot = fileURLToPath(astroConfig.root);

        const extraEntriesModuleCode = config.docs?.extraEntries
          ? virtualReexportDefault({
              filePath: path.resolve(astroRoot, config.docs.extraEntries),
              exportName: "extraEntries",
              resolveCallable: true,
            })
          : `export const extraEntries = [];`;

        const logoFallback = config.logo ? path.resolve(astroRoot, config.logo) : null;
        const { name: projectName, description: projectDescription } = siteConfig.project;

        const ogImage = resolveImageSource(
          config.meta?.og?.image,
          astroRoot,
          logoFallback,
          projectName,
          projectDescription,
        );
        const rawTwitterImage = resolveImageSource(
          config.meta?.twitter?.image,
          astroRoot,
          logoFallback,
          projectName,
          projectDescription,
        );
        const twitterSharesOg =
          config.meta?.twitter?.image === undefined && ogImage.mode !== "none";
        const twitterImage =
          rawTwitterImage.mode === "none" && ogImage.mode !== "none" ? ogImage : rawTwitterImage;

        const needsSatori = isGenerated(ogImage) || (!twitterSharesOg && isGenerated(twitterImage));

        if (needsSatori) {
          try {
            createRequire(import.meta.url).resolve("sharp");
          } catch {
            throw new Error(
              `[astro-pigment] Generated OG images require the "sharp" package. ` +
                `Install it in your project: npm install sharp (or pnpm add sharp)`,
            );
          }
        }

        const ogTemplateModuleCode =
          ogImage.mode === "template" && ogImage.templatePath
            ? virtualReexportDefault({
                filePath: ogImage.templatePath,
                exportName: "template",
              })
            : `export const template = null;`;
        const twitterTemplateModuleCode =
          !twitterSharesOg && twitterImage.mode === "template" && twitterImage.templatePath
            ? virtualReexportDefault({
                filePath: twitterImage.templatePath,
                exportName: "template",
              })
            : `export const template = null;`;

        const ogImageUrl = ogImage.mode !== "none" ? "/og.png" : null;
        const twitterImageUrl = twitterSharesOg
          ? ogImageUrl
          : twitterImage.mode !== "none"
            ? "/twitter-image.png"
            : null;

        const virtualModuleCode = buildConfigModule({
          siteConfig,
          githubUrl,
          publicSiteUrl,
          logo,
          huePicker,
          clientRouter,
          search,
          theme: { hue: themeHue },
          docs: { ...docsConfig, navLinks },
          meta: {
            lang,
            titleSuffix,
            mainPageTitle,
            icon: { faviconPath, manifestIconPath },
            og: {
              image: { ...ogImage, alt: ogImageAlt, url: ogImageUrl },
              fontPaths: ogFontPaths,
            },
            twitter: {
              image: { ...twitterImage, alt: twitterImageAlt, url: twitterImageUrl },
              site: twitterSite,
              creator: twitterCreator,
            },
          },
        });

        const integrations: AstroIntegration[] = [];

        if (!astroConfig.integrations.some((i) => i.name === "@astrojs/mdx")) {
          integrations.push(mdx());
        }

        integrations.push(sitemap());

        injectRoute({
          pattern: "/404",
          entrypoint: path.resolve(__dirname, "pages/404.astro"),
        });
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
        injectRoute({
          pattern: "/robots.txt",
          entrypoint: path.resolve(__dirname, "pages/robots.txt.ts"),
        });

        if (ogImage.mode !== "none") {
          injectRoute({
            pattern: "/og.png",
            entrypoint: path.resolve(__dirname, "pages/og.png.ts"),
          });
        }
        if (!twitterSharesOg && twitterImage.mode !== "none") {
          injectRoute({
            pattern: "/twitter-image.png",
            entrypoint: path.resolve(__dirname, "pages/twitter-image.png.ts"),
          });
        }

        for (const cssPath of config.theme?.customCss ?? []) {
          const resolved = path.resolve(astroRoot, cssPath);
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
          ...(config.theme?.fonts !== false && { fonts: fonts() }),
          markdown: {
            shikiConfig,
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "prepend",
                  properties: {
                    className: ["anchor"],
                    ariaHidden: true,
                    tabIndex: -1,
                  },
                  content: [],
                },
              ],
            ],
          },
          vite: {
            css: {
              modules: { generateScopedName },
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
                  if (id === VIRTUAL_EXTRA_ENTRIES_ID) return RESOLVED_VIRTUAL_EXTRA_ENTRIES_ID;
                  if (id === VIRTUAL_OG_TEMPLATE_ID) return RESOLVED_VIRTUAL_OG_TEMPLATE_ID;
                  if (id === VIRTUAL_TWITTER_TEMPLATE_ID)
                    return RESOLVED_VIRTUAL_TWITTER_TEMPLATE_ID;
                  return undefined;
                },
                load(id: string) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) return virtualModuleCode;
                  if (id === RESOLVED_VIRTUAL_EXTRA_ENTRIES_ID) return extraEntriesModuleCode;
                  if (id === RESOLVED_VIRTUAL_OG_TEMPLATE_ID) return ogTemplateModuleCode;
                  if (id === RESOLVED_VIRTUAL_TWITTER_TEMPLATE_ID) return twitterTemplateModuleCode;
                  return undefined;
                },
              },
              transitiveCssPlugin(),
            ],
          },
        });
      },
    },
  };
}
