---
title: "API"
description: Integration config, stores, fonts, CSS customization, SEO endpoints, and exportable configs.
order: 2
---

## Integration Config

The integration accepts a single config object combining site metadata and optional features:

```ts
docsTheme({
  // Required: project metadata shown in header/footer
  project: {
    name: "my-project",
    description: "What it does",
    license: { name: "MIT", url: "https://..." },
    // GitHub repo info. Used to derive site URL and GitHub link.
    github: {
      user: "psd-coder",       // one of user/organization required
      // organization: "my-org",
      repository: "my-project",
    },
  },

  // Required: author link in header/footer
  author: {
    name: "Your Name",
    url: "https://x.com/your_handle",
    // icon auto-detected: "x" for x.com URLs, generic link otherwise
  },

  // Optional: additional credits rendered as "& Name" after author in footer
  credits: [
    { name: "Evil Martians", url: "https://evilmartians.com/" },
  ],

  // Optional: override auto-derived GitHub Pages URL
  site: "https://custom-domain.com",

  // Optional: source icon(s) for favicons, apple-touch-icon, and webmanifest.
  // String form: single 512x512 PNG/SVG used for all sizes.
  icon: "src/assets/icon.svg",
  // Object form: separate sources. `favicon` is used for tiny renders
  // (favicon.svg, favicon.ico); `manifest` is used for 96px and up.
  // icon: {
  //   favicon: "src/assets/favicon.svg",
  //   manifest: "src/assets/icon-detailed.svg",
  // },

  // Optional: show hue slider in header to pick a theme hue.
  // Use it to find the right value, then set --theme-hue-override and remove this.
  hueSlider: true,

  // Optional: syntax highlighting themes (overrides adaptive hue-based theme)
  shikiThemes: { light: "github-light", dark: "github-dark" },

  // Optional: header navigation links (href accepts "/api" or "api")
  navLinks: [
    { href: "/", label: "Overview" },
    { href: "/api", label: "API" },
  ],

  // Optional: enable Astro ViewTransitions. Default: true.
  // clientRouter: false,

  // Optional: enable full-text search UI in header. Default: true.
  // search: false,

  // Optional: docs collection settings (all fields optional, sensible defaults applied)
  docs: {
    directory: "src/content/docs", // default; also controls defineDocsCollections() glob base
    deepSections: ["api"],
    renderDefaultPage: true,       // default; set false to ship your own [...slug].astro
    tocItemsSelector: ".prose :is(h2, h3)[id]", // default
  },
})
```

### What the integration does

1. Stores config in a **virtual module** (`virtual:theme-integration-config`) so components read it automatically
2. Auto-sets `site` and `base` from GitHub config (GitHub Pages URL in CI, `/` in dev)
3. Injects **rehype-slug** + **rehype-autolink-headings**
4. Injects an **adaptive Shiki theme** that derives syntax colors from `--theme-hue` (based on Catppuccin, hue-rotated via OKLch). Override with `shikiThemes` to use fixed themes instead.
5. Injects **PostCSS preset-env** (nesting, custom-media, media-query-ranges)
6. Injects **sitemap** + `llms.txt`, `llms-full.txt`, `[slug].md` routes
7. Injects `/[...slug]` page that renders docs from the content collection (opt out with `docs.renderDefaultPage: false`)
8. When `search: true` (default): injects `/search-index.json` and renders a search input in the Layout header
9. When `clientRouter: true` (default): enables Astro View Transitions via `<ClientRouter />`
10. When `icon` is configured: generates **favicons** (svg, ico, 96x96 png), **apple-touch-icon**, **webmanifest** + manifest icons (192x192, 512x512)

## CSS Customization

The theme uses CSS variables with fallback defaults. Override them in your own CSS:

```css
:root {
  --theme-hue-override: 135;         /* green instead of default cyan (180) */
  --layout-width-override: 1280px;   /* wider layout */
  --layout-sidebar-width-override: 280px;
}
```

All color tokens derive from `--theme-hue` using OKLch, so changing the hue recolors the entire site, including syntax highlighting in code blocks.

### Picking a hue

Enable `hueSlider: true` in the integration config to show a hue slider in the header. Drag it to find the right value, then hardcode it with `--theme-hue-override` and remove `hueSlider`:

```css
:root {
  --theme-hue-override: 135;
}
```

The slider persists its value to `localStorage`, so you can test across page loads. Once you've settled on a hue, turn it off: the slider is a setup tool, not a production feature.

### Color tokens

| Token | Light | Dark |
|-------|-------|------|
| `--color-surface-1` | 99% lightness | 12% lightness |
| `--color-surface-2` | 98% | 18% |
| `--color-surface-3` | 96% | 21% |
| `--color-accent` | 55% | 65% |
| `--color-text-primary` | 15% | 90% |
| `--color-text-secondary` | 40% | 75% |
| `--color-border` | 90% | 25% |

### Typography and spacing

Text sizes from `--text-xxs` (0.625rem) to `--text-2xl` (2rem). Spacing base `--spacing` is 4px. Border radii: `--radius-sm` (4px), `--radius-md` (8px).

### Responsive breakpoints

```css
@custom-media --mobiles (max-width: 48rem);   /* <768px */
@custom-media --tablets (max-width: 64rem);   /* <1024px */
@custom-media --laptops (max-width: 80rem);   /* <1280px */
```

Import `astro-pigment/styles/media.css` to use these in your own CSS.

## Fonts

The integration auto-injects bundled **Martian Grotesk** (variable weight sans) and **Martian Mono** (400 monospace), setting `--font-sans` and `--font-mono` CSS variables. Pass `fonts: false` to opt out and provide your own via Astro's top-level `fonts` field.

```js
// Opt out of bundled fonts and use your own
docsTheme({
  // ...
  fonts: false,
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
import { $themeSetting, $resolvedTheme, cycleTheme }
  from "astro-pigment/stores/theme";

$themeSetting.get()   // "auto" | "light" | "dark"
$resolvedTheme.get()  // "light" | "dark"
cycleTheme()          // auto -> light -> dark -> auto

// Media queries
import { $prefersDarkScheme, $prefersReducedMotion }
  from "astro-pigment/stores/media";

$prefersDarkScheme.get()      // boolean
$prefersReducedMotion.get()   // boolean
```

Both stores are powered by [nanostores](https://github.com/nanostores/nanostores). Theme preference persists to `localStorage`.

### Package manager store

From `astro-pigment/stores/pkgManager`:

```ts
import { $pkgManager } from "astro-pigment/stores/pkgManager";

$pkgManager.get() // "pnpm" | "npm" | "yarn" | "bun"
```

Used by `InstallPackage` internally. Also available for custom `CodePanels`-based tab switchers via `defineCodePanels`:

```ts
import { defineCodePanels } from "astro-pigment/utils/defineCodePanels";
import { $pkgManager } from "astro-pigment/stores/pkgManager";

defineCodePanels("x-my-switcher", $pkgManager);
```

## SEO and LLM Endpoints

When `docs` is configured in the integration, four endpoints are auto-generated:

| Endpoint | Description |
|----------|-------------|
| `/llms.txt` | Structured index: project name, description, per-doc `##` sections |
| `/llms-full.txt` | All docs concatenated into a single markdown file |
| `/[slug].md` | Individual markdown for each doc |
| `/sitemap-index.xml` | Standard sitemap via `@astrojs/sitemap` |

Docs are sorted by the `order` field in frontmatter. Frontmatter and import statements are stripped from the output.

## Search

Full-text search is enabled by default (`search: true`). When enabled:

- Injects a `/search-index.json` endpoint built from all docs at build time
- Renders a search input in the Layout header that queries the index client-side

To disable:

```ts
docsTheme({
  search: false,
  // ...
})
```

## Favicon and Webmanifest

`icon` accepts either a single source path or an object with two sources:

```js
// Single source (same icon for all sizes)
icon: "src/assets/icon.svg",

// Two sources — simplified design for tiny favicons, detailed for manifest
icon: {
  favicon: "src/assets/favicon.svg",
  manifest: "src/assets/icon-detailed.svg",
},
```

Use the object form when a detailed 512x512 design becomes illegible at 16-32px. Both `favicon` and `manifest` are required in the object form.

| File | Source | Size/Format |
|------|--------|-------------|
| `/favicon.svg` | `favicon` | Passthrough (SVG source only) |
| `/favicon.ico` | `favicon` | 32x32 ICO |
| `/favicon-96x96.png` | `manifest` | 96x96 PNG |
| `/apple-touch-icon.png` | `manifest` | 180x180 PNG |
| `/web-app-manifest-192x192.png` | `manifest` | 192x192 PNG |
| `/web-app-manifest-512x512.png` | `manifest` | 512x512 PNG |
| `/site.webmanifest` | — | JSON manifest with project name and icon refs |

The Layout `<head>` renders the corresponding `<link>` tags only when `icon` is set. Uses `sharp` for image resizing (bundled with the theme).

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
    files: z.array(z.object({
      name: z.string(),
      type: z.enum(["html", "javascript", "css", "importmap"]),
      lang: z.enum(["html", "javascript", "css"]),
      content: z.string(),
    })),
  }),
});
```

The loader parses `.html` files with `data-type` attributes into `FileEntry` arrays compatible with the `CodeExample` playground component. Requires `linkedom` (bundled with the theme).

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
