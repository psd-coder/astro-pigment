---
title: "API"
description: Integration config, stores, fonts, CSS customization, SEO endpoints, and exportable configs.
order: 2
---

## Integration Config

The integration accepts a single config object combining site metadata and optional features. `site` must be set at the top level of `defineConfig` — Astro uses it to construct absolute URLs and the integration enforces this:

```ts
// astro.config.mjs
export default defineConfig({
  site: "https://your-name.github.io", // required
  integrations: [docsTheme({ ... })],
});
```

```ts
docsTheme({
  // Required: project metadata shown in header/footer
  project: {
    name: "my-project",
    description: "What it does",
    license: { name: "MIT", url: "https://..." },
    // GitHub repo info. Used to derive site URL and GitHub link.
    github: {
      user: "psd-coder", // one of user/organization required
      // organization: "my-org",
      repository: "my-project",
    },
  },

  // Optional: author link in header/footer. Omit to render no author.
  author: {
    name: "Your Name",
    url: "https://x.com/your_handle",
    // icon: path to SVG file rendered inline. Overrides the x.com auto-icon
    // when set, and is required when url is not an x.com URL.
    // icon: "src/assets/author.svg",
  },

  // Optional: additional credits rendered as "& Name" after author in footer
  credits: [{ name: "Evil Martians", url: "https://evilmartians.com/" }],

  // Optional: path to SVG file rendered as the header logo.
  // Replaces the default project name text. The logo slot in Layout still overrides this.
  // logo: "src/assets/logo.svg",

  // Optional: show hue slider in header to pick a theme hue.
  // Use it to find the right value, then set theme.hue in config and remove this.
  huePicker: true,

  // Optional: enable Astro ViewTransitions. Default: true.
  // clientRouter: false,

  // Optional: enable full-text search UI in header. Default: true.
  // search: false,

  // Optional: theme tokens. Hue feeds CSS variables and the auto OG template.
  theme: {
    // hue: 220,
    // Syntax highlighting themes (overrides adaptive hue-based theme)
    // shiki: { light: "github-light", dark: "github-dark" },
    // Inject bundled Martian Grotesk + Mono fonts. Default: true.
    // fonts: false,
    // CSS files to inject into every page. Paths relative to project root.
    // customCss: ["src/styles/custom.css"],
  },

  // Optional: SEO / meta settings
  meta: {
    // HTML lang attribute. Default: "en".
    // lang: "fr",
    // Appended as " | {suffix}" to every sub-page <title>. false = no suffix.
    // Default: project.name.
    // titleSuffix: "My Project — Docs",
    // titleSuffix: false,
    // Full <title> for the root/index page, bypassing the normal "{page} | {suffix}" pattern.
    // Default: "{project.name} Documentation".
    // mainPageTitle: "My Project — Fast & Simple",
    // Source icon(s) for favicons, apple-touch-icon, and webmanifest.
    // String form: single 512x512 PNG/SVG used for all sizes.
    icon: "src/assets/icon.svg",
    // Object form: separate sources. `favicon` is used for tiny renders
    // (favicon.svg, favicon.ico); `manifest` is used for 96px and up.
    // icon: {
    //   favicon: "src/assets/favicon.svg",
    //   manifest: "src/assets/icon-detailed.svg",
    // },
    // Open Graph image. Defaults to true when unset. Three forms:
    //   string   -> path to PNG, served at /og.png
    //   true     -> built-in template, uses top-level `logo` if set
    //   object   -> override any of: template, logo, title, description
    // Object fields (all optional):
    //   logo:        string path / false (opt out) / absent (uses top-level `logo`)
    //   template:    path to .ts default-exporting OgTemplateFn
    //   title:       replace project.name shown on the card
    //   description: replace project.description shown on the card
    // og: { image: { logo: "src/assets/og-logo.svg", title: "My App" }, imageAlt: "Alt" },
    // Twitter card. Image defaults to og.image.
    // twitter: { site: "@my_org", creator: "@me" },
  },

  // Optional: docs collection settings (all fields optional, sensible defaults applied)
  docs: {
    directory: "src/content/docs", // default; also controls defineDocsCollections() glob base
    renderDefaultPage: true, // default; set false to ship your own [...slug].astro
    // Optional: header navigation links (href accepts "/api" or "api")
    navLinks: [
      { href: "/", label: "Overview" },
      { href: "/api", label: "API" },
    ],
    // Optional: extra entries for search index + llms.txt from non-collection pages.
    // Path to a module that default-exports ExtraEntry[] or () => Promise<ExtraEntry[]>.
    // extraEntries: "./src/extra-entries.ts",
  },
});
```

### What the integration does

1. Stores config in a **virtual module** (`virtual:pigment-config`) so components read it automatically
2. Requires `site` in `astro.config.mjs`; auto-sets `base` from GitHub config (`/repo/` in CI, `/` in dev)
3. Injects **rehype-slug** + **rehype-autolink-headings**
4. Injects an **adaptive Shiki theme** that derives syntax colors from `--theme-hue` (based on Catppuccin, hue-rotated via OKLch). Override with `theme.shiki` to use fixed themes instead.
5. Injects **PostCSS preset-env** (nesting, custom-media, media-query-ranges)
6. Injects **sitemap** + `llms.txt`, `llms-full.txt`, `[slug].md` routes
7. Injects `/[...slug]` page that renders docs from the content collection (opt out with `docs.renderDefaultPage: false`)
8. When `search: true` (default): injects `/search-index.json` and renders a search input in the Layout header
9. When `clientRouter: true` (default): enables Astro View Transitions via `<ClientRouter />`
10. When `meta.icon` is configured: generates **favicons** (svg, ico, 96x96 png), **apple-touch-icon**, **webmanifest** + manifest icons (192x192, 512x512)
11. Always serves `/robots.txt` (permissive, with `Sitemap:` pointing at `/sitemap-index.xml`)
12. Always serves `/og.png` (built-in template by default, or whatever `meta.og.image` specifies) and emits `<meta property="og:image">` at 1200x630
13. Twitter falls back to the OG image; emits `summary_large_image` Twitter card tags. Override with `meta.twitter.image` to use a different mode/path

## CSS Customization

The theme uses CSS variables with fallback defaults. Override them in your own CSS:

```css
:root {
  --layout-width-override: 1280px; /* wider layout */
  --layout-sidebar-width-override: 280px;
}
```

For hue, use `theme.hue` in the integration config — it's the single source of truth for both the site CSS and the auto-generated OG image. All color tokens derive from `--theme-hue` using OKLch, so changing the hue recolors the entire site, including syntax highlighting in code blocks.

### Picking a hue

Enable `huePicker: true` in the integration config to show a hue slider in the header. Drag it to find the right value, then set `theme.hue` in config and remove `huePicker`:

```js
docsTheme({
  // ...
  theme: { hue: 135 },
});
```

The slider persists its value to `localStorage`, so you can test across page loads. Once you've settled on a hue, turn it off: the slider is a setup tool, not a production feature.

### Color tokens

| Token                    | Light         | Dark          |
| ------------------------ | ------------- | ------------- |
| `--color-surface-1`      | 99% lightness | 12% lightness |
| `--color-surface-2`      | 98%           | 18%           |
| `--color-surface-3`      | 96%           | 21%           |
| `--color-accent`         | 55%           | 65%           |
| `--color-text-primary`   | 15%           | 90%           |
| `--color-text-secondary` | 40%           | 75%           |
| `--color-border`         | 90%           | 25%           |

### Typography and spacing

Text sizes from `--text-xxs` (0.625rem) to `--text-2xl` (2rem). Spacing base `--spacing` is 4px. Border radii: `--radius-sm` (4px), `--radius-md` (8px).

### Responsive breakpoints

```css
@custom-media --mobiles (max-width: 48rem); /* <768px */
@custom-media --tablets (max-width: 64rem); /* <1024px */
@custom-media --laptops (max-width: 80rem); /* <1280px */
```

Import `astro-pigment/styles/media.css` to use these in your own CSS.

## Fonts

The integration auto-injects bundled **Martian Grotesk** (variable weight sans) and **Martian Mono** (400 monospace), setting `--font-sans` and `--font-mono` CSS variables. Pass `theme.fonts: false` to opt out and provide your own via Astro's top-level `fonts` field.

```js
// Opt out of bundled fonts and use your own
docsTheme({
  // ...
  theme: { fonts: false },
}),
// then in defineConfig:
fonts: [
  { provider: fontProviders.google(), name: "Inter", cssVariable: "--font-sans" },
  { provider: fontProviders.google(), name: "Fira Code", cssVariable: "--font-mono" },
],
```

## Stores

Reactive state stores available for client-side code:

```ts
// Theme store
import { $themeSetting, $resolvedTheme, cycleTheme } from "astro-pigment/stores/theme";

$themeSetting.get(); // "auto" | "light" | "dark"
$resolvedTheme.get(); // "light" | "dark"
cycleTheme(); // auto -> light -> dark -> auto

// Media queries
import { $prefersDarkScheme, $prefersReducedMotion } from "astro-pigment/stores/media";

$prefersDarkScheme.get(); // boolean
$prefersReducedMotion.get(); // boolean
```

Both stores are powered by [nanostores](https://github.com/nanostores/nanostores). Theme preference persists to `localStorage`.

### Package manager store

From `astro-pigment/stores/pkgManager`:

```ts
import { $pkgManager } from "astro-pigment/stores/pkgManager";

$pkgManager.get(); // "pnpm" | "npm" | "yarn" | "bun"
```

Used by `InstallPackage` internally. Also available for custom `CodePanels`-based tab switchers via `defineCodePanels`:

```ts
import { defineCodePanels } from "astro-pigment/utils/defineCodePanels";
import { $pkgManager } from "astro-pigment/stores/pkgManager";

defineCodePanels("x-my-switcher", $pkgManager);
```

## SEO and LLM Endpoints

When `docs` is configured in the integration, four endpoints are auto-generated:

| Endpoint             | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `/llms.txt`          | Structured index: project name, description, per-doc `##` sections |
| `/llms-full.txt`     | All docs concatenated into a single markdown file                  |
| `/[slug].md`         | Individual markdown for each doc (and extra entries with `body`)   |
| `/sitemap-index.xml` | Standard sitemap via `@astrojs/sitemap`                            |

Docs are sorted by the `order` field in frontmatter. Frontmatter and import statements are stripped from the output.

When `docs.extraEntries` is configured, those entries are appended after docs in `llms.txt` and `llms-full.txt`. Entries with a `body` field also get individual `/[id].md` routes.

### Extra Entries

Each entry has `id` (URL path segment), `title`, `description`, `order`, and optional `body` (markdown). Pass a static array for simple cases, or a module path for dynamic data:

```ts
// src/extra-entries.ts
import type { ExtraEntry } from "astro-pigment";
import { getCollection } from "astro:content";

export default async function (): Promise<ExtraEntry[]> {
  const examples = await getCollection("examples");
  return examples.map((ex) => ({
    id: `examples/${ex.id}`,
    title: ex.data.title,
    description: ex.data.description,
    order: 101,
  }));
}
```

The module must default-export an `ExtraEntry[]` or a function returning `Promise<ExtraEntry[]>`.

## Search

Full-text search is enabled by default (`search: true`). When enabled:

- Injects a `/search-index.json` endpoint built from all docs (and `extraEntries`) at build time
- Renders a search input in the Layout header that queries the index client-side
- Extra entries with `body` are split into sections like docs; entries without `body` are indexed by title and description

To disable:

```ts
docsTheme({
  search: false,
  // ...
});
```

## Favicon and Webmanifest

`meta.icon` accepts either a single source path or an object with two sources:

```js
// Single source (same icon for all sizes)
meta: { icon: "src/assets/icon.svg" }

// Two sources — simplified design for tiny favicons, detailed for manifest
meta: {
  icon: {
    favicon: "src/assets/favicon.svg",
    manifest: "src/assets/icon-detailed.svg",
  },
}
```

Use the object form when a detailed 512x512 design becomes illegible at 16-32px. Both `favicon` and `manifest` are required in the object form.

| File                            | Source     | Size/Format                                   |
| ------------------------------- | ---------- | --------------------------------------------- |
| `/favicon.svg`                  | `favicon`  | Passthrough (SVG source only)                 |
| `/favicon.ico`                  | `favicon`  | 32x32 ICO                                     |
| `/favicon-96x96.png`            | `manifest` | 96x96 PNG                                     |
| `/apple-touch-icon.png`         | `manifest` | 180x180 PNG                                   |
| `/web-app-manifest-192x192.png` | `manifest` | 192x192 PNG                                   |
| `/web-app-manifest-512x512.png` | `manifest` | 512x512 PNG                                   |
| `/site.webmanifest`             | —          | JSON manifest with project name and icon refs |

The Layout `<head>` renders the corresponding `<link>` tags only when `meta.icon` is set. Uses `sharp` for image resizing (bundled with the theme).

## Open Graph and Twitter Cards

`/og.png` is always served. By default it uses a built-in satori template; override via `meta.og.image`:

> **Tip:** in most cases, provide a dedicated `image.logo`. Your site logo is tuned for the site's own surface colors (light/dark neutrals), but the OG card uses a theme-hue-tinted background — a logo that reads cleanly on the site can lose contrast or clash on the card. An OG-specific variant with a palette tuned for that background keeps the mark legible across any `theme.hue`.

```ts
// Default: built-in template with fallback logo. No config needed.
// meta: { og: { image: true } }

// Static PNG (served as-is)
meta: { og: { image: "src/assets/og.png" } };

// Built-in template with overrides (all fields optional)
meta: {
  og: {
    image: {
      logo: "src/assets/og-logo.png", // string path | false (skip) | absent (fallback)
      title: "My App",                // override project.name on the card
      description: "Short pitch",     // override project.description on the card
    },
  },
};

// Custom satori template (same override fields apply)
meta: {
  og: {
    image: {
      template: "./src/og-template.ts",
      title: "My App",
    },
  },
};
```

Built-in and template modes require `sharp` (same peer dep as `meta.icon`). The built-in template uses `theme.hue` for color, bundled Martian Grotesk + Mono, and `project.{name,description}`. Logo resolution: explicit `image.logo` (string) → top-level `logo` → nothing. The resolved logo is rendered in its original colors (no processing) and replaces the project name; pass `image: { logo: false }` to render only the project name even when a top-level `logo` is set.

The built-in OG template always uses the bundled Martian fonts — it does **not** pick up whatever you've configured in Astro's top-level `fonts` option. Astro's font pipeline emits woff2 only, but satori requires TTF/OTF, so server-side image generation is decoupled from browser-served fonts. To use different typography in your OG card, switch to a custom template (mode 2 above) and load your own TTF/OTF buffers inside it — `ctx.fonts` is provided as a convenience but isn't required.

Custom templates default-export an `OgTemplateFn`:

```ts
// src/og-template.ts
import type { OgTemplateFn } from "astro-pigment";

const template: OgTemplateFn = (ctx) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      width: "1200px",
      height: "630px",
      color: "white",
      background: `hsl(${ctx.hue} 30% 12%)`,
    },
    children: ctx.projectName,
  },
});

export default template;
```

Satori's color parser doesn't handle `oklch()` — stick to hex, `rgb()`, or `hsl()` inside templates.

`ctx` exposes `projectName`, `description`, `siteUrl`, `pathname`, `logo` (`{ src: dataUri, width, height }` if `meta.og.logo` resolves, else undefined), `hue`, and `fonts` (Martian Grotesk Std Regular/Bold, Martian Mono Regular) for satori.

Twitter falls back to the OG image when `meta.twitter.image` is unset; set it independently to use a different mode/path. Twitter card is always `summary_large_image` when an image is present.

## Examples Loader

For sites with interactive code examples, import the content collection loader:

```ts
// content.config.ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { examplesLoader } from "astro-pigment/loaders/examples";

const examples = defineCollection({
  loader: examplesLoader("src/content/examples/"),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    descriptionHtml: z.string().default(""),
    files: z.array(
      z.object({
        name: z.string(),
        type: z.enum(["html", "javascript", "css", "importmap"]),
        lang: z.enum(["html", "javascript", "css"]),
        content: z.string(),
      }),
    ),
  }),
});
```

The loader parses `.html` files with `data-type` attributes into `FileEntry` arrays compatible with the `CodeExample` playground component. An element with `id="description"` is extracted as `descriptionHtml` (rich HTML description); if absent, `descriptionHtml` falls back to the plain-text `description`. Requires `linkedom` (bundled with the theme).

## Exportable Configs

Stylelint config with CSS standards, clean ordering, and CSS Modules support:

```js
// stylelint.config.js
export default { extends: ["astro-pigment/stylelint.config"] };
```

Browserslist targeting last 2 versions:

```
// .browserslistrc
extends astro-pigment/browserslist
```
