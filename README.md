# astro-pigment

An Astro documentation theme with dark mode, interactive playgrounds, and SEO endpoints. One integration call gives you a complete docs site: layout, navigation, table of contents, code highlighting, LLM-friendly endpoints, and a library of interactive components.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

- **Single integration**: rehype plugins, PostCSS, Shiki themes, sitemap, and SEO routes configured automatically
- **Dark mode**: three-state toggle (auto/light/dark) with View Transitions, no FOUC
- **Theming**: set `theme.hue` and `theme.saturation` in config; all colors derive via OKLch
- **Interactive playgrounds**: CodeMirror editor + sandboxed live preview with console capture
- **LLM endpoints**: `/llms.txt` and `/llms-full.txt` auto-generated from your markdown content
- **Social cards**: auto-generated `/og.png` and Twitter card meta tags, with a built-in template, static PNG, or custom satori template (dedicated `meta.og.image.logo` recommended for best results)
- **Auto-generated favicons**: provide one or two source icons, get favicon.ico, SVG, PNG, apple-touch-icon, and webmanifest
- **robots.txt + sitemap**: served out of the box, sitemap URL resolved from site+base
- **Bundled fonts**: Martian Grotesk + Martian Mono auto-injected (opt out with `theme.fonts: false`)
- **Accessible**: roving focus, ARIA attributes, keyboard navigation throughout
- **Zero build step**: Astro resolves `.astro`/`.ts` source directly from the package

## Sites built with it

- [astro-pigment](https://astro-pigment.psdcoder.dev) — these docs, dogfooding every component ([source](https://github.com/psd-coder/astro-pigment/tree/main/docs))
- [nanotags](https://nanotags.psdcoder.dev) — tiny Custom Elements wrapper with nanostores reactivity ([source](https://github.com/psd-coder/nanotags/tree/main/apps/docs))
- [datavolve](https://datavolve.psdcoder.dev) — type-safe evolutions for versioned data ([source](https://github.com/psd-coder/datavolve/tree/main/apps/docs))
- [typed-channel](https://typed-channel.psdcoder.dev) — type-safe messaging between contexts ([source](https://github.com/psd-coder/typed-channel/tree/main/docs))

## Installation

```bash
pnpm add astro-pigment astro nanotags nanostores
```

## Quick Start

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import docsTheme from "astro-pigment";

export default defineConfig({
  site: "https://your-name.github.io",
  integrations: [
    docsTheme({
      project: {
        name: "my-project",
        description: "A short description of your project",
        license: {
          name: "MIT",
          url: "https://github.com/your-name/your-repo/blob/main/LICENSE",
        },
        github: { user: "your-name", repository: "your-repo" },
      },
      author: { name: "Your Name", url: "https://x.com/your_handle" },
      meta: { icon: "src/assets/icon.svg" },
      docs: {
        navLinks: [
          { href: "/", label: "Overview" },
          { href: "/api", label: "API" },
        ],
      },
    }),
  ],
});
```

```ts
// src/content.config.ts
import { defineDocsCollections, defineMenuCollection } from "astro-pigment/content";

export const collections = {
  ...defineDocsCollections(),
  ...defineMenuCollection(), // optional: section menus, see below
};
```

Drop your `.md`/`.mdx` files in `src/content/docs/`. The integration injects `/[...slug]` automatically; pages render with the full layout, on-this-page rail, prev/next navigation, and edit-on-github link out of the box. Dark mode, sticky header, mobile popovers, code copy buttons, favicons, webmanifest, sitemap, and LLM endpoints are all wired up automatically.

To render pages yourself, set `docs.renderDefaultPage: false` and create your own `src/pages/[...slug].astro`. Reuse the boilerplate via `getDocsStaticPaths` from `astro-pigment/utils/content`.

### Page frontmatter

| Field         | Type      | Default | Purpose                                             |
| ------------- | --------- | ------- | --------------------------------------------------- |
| `title`       | `string`  | —       | Page title (heading, `<title>`, search, nav)        |
| `description` | `string`  | —       | Meta description and search summary                 |
| `order`       | `number`  | —       | Global reading order (sort, prev/next, `llms.txt`)  |
| `menu`        | `string`  | —       | Left column: id of a menu to render                 |
| `toc`         | `boolean` | `true`  | Right column: whether the on-this-page rail renders |

Each column is decided by its own field, so layout is per page: no `menu` and `toc: true` is a two-column prose page, `menu: "<id>"` adds the section nav on the left for three columns, and `toc: false` drops the right rail. Below the laptop breakpoint both rails collapse into popovers reached from a floating button group.

A section's landing page is an ordinary `index` file inside its directory: `src/content/docs/api/index.mdx` serves at `/api`, mirroring the root `src/content/docs/index.mdx` → `/`. Astro strips the trailing `index` when deriving entry ids, so that file is the entry `api` — the same id `api.mdx` would get, so use one or the other.

### Menu collection

A menu is a reusable, flat section navigation defined once as JSON and attached to any number of pages. Register `defineMenuCollection()` (above), then drop files in `src/content/menu/` — the filename is the menu id, so `src/content/menu/api.json` is the menu `"api"`, referenced by a page's `menu: "api"`.

```json
{
  "groups": [
    { "label": "Overview", "href": "/api" },
    {
      "label": "Reference",
      "items": [{ "title": "Page frontmatter", "href": "/api/page-frontmatter" }]
    },
    { "label": "Astro docs", "href": "https://docs.astro.build", "attrs": { "target": "_blank" } }
  ]
}
```

```ts
type Menu = { groups: MenuGroup[] };
type MenuGroup = { label: string | null; href?: string; attrs?: LinkAttrs; items?: MenuItem[] };
type MenuItem = { title: string; href: string; attrs?: LinkAttrs };
type LinkAttrs = Record<string, string | number | boolean>; // spread on the <a>, false drops it
```

A group heading with an `href` renders as a link (standalone when `items` is empty, a section landing when not); `label: null` renders its items flat with no heading. An `href` carrying a scheme or a leading `//` is external — used verbatim, never marked active. Everything else resolves against the site base. Menus are validated at build time, and a page pointing at a menu id that doesn't exist fails the build.

The menu directory is fixed at `src/content/menu/` — unlike `docs.directory`, it isn't configurable. Menus render only through the built-in `/[...slug]` page; if you render pages yourself, you supply your own left sidebar.

### Pick theme colors (optional)

Temporarily enable the theme picker to dial in hue and saturation for your site:

```js
docsTheme({
  // ...your config
  themePicker: true, // shows a hue + saturation picker on the page
});
```

Drag the hue ring and saturation slider, pick values you like, then hardcode them in CSS and remove `themePicker`:

```js
docsTheme({
  // ...your config
  theme: { hue: 135, saturation: 70 },
});
```

All UI colors derive from these values via OKLch. Saturation is a 0-100 multiplier applied to surfaces, text, accent, and border chromas (default 50 = current look, 0 = monochrome, 100 = 2x). Code syntax highlighting keeps its own tuned chromas and only follows the hue.

## Integration Config

```ts
type DocsThemeConfig = {
  // Required
  project: {
    name: string;
    description: string;
    license: { name: string; url: string };
    github: {
      user?: string; // one of user/organization required
      organization?: string;
      repository: string;
    };
  };

  // Optional
  author?: { name: string; url: string; icon?: string };
  credits?: Array<{ name: string; url: string }>;
  logo?: string; // path to SVG rendered as header logo
  clientRouter?: boolean; // Astro View Transitions, default true
  search?: boolean; // full-text search, default true
  themePicker?: boolean; // show hue + saturation picker in header for initial theme setup
  theme?: {
    hue?: number; // base hue 0-360, default 180
    shiki?: { light: string; dark: string }; // overrides adaptive theme
    fonts?: boolean; // bundled Martian fonts, default true
    customCss?: string[]; // CSS files injected into every page
  };
  docs?: {
    directory?: string; // default: "src/content/docs"
    renderDefaultPage?: boolean; // default: true
    navLinks?: Array<{
      href: string;
      label: string;
      attrs?: Partial<HTMLAttributes<"a">>; // spread on the <a>
    }>;
    extraEntries?: string; // path to module exporting ExtraEntry[] or () => Promise<ExtraEntry[]>
  };
  meta?: {
    lang?: string; // <html lang>, default "en"
    titleSuffix?: string | false; // " | {suffix}" on sub-pages, default project.name
    mainPageTitle?: string; // <title> for "/", default "{project.name} documentation"
    icon?: string | { favicon: string; manifest: string }; // favicons + webmanifest (requires sharp)
    og?: {
      // image modes: string path | true (built-in template) | { template: "./file.ts" }
      image?: string | true | { template: string };
      imageAlt?: string;
    };
    twitter?: {
      site?: string;
      creator?: string; // auto-derived from author.url if x.com
      image?: string | true | { template: string }; // defaults to og.image
      imageAlt?: string;
    };
  };
};
```

### What the integration does

- Stores config in a virtual module (`virtual:pigment-config`) so components read it automatically
- Requires `site` in `astro.config.mjs`; auto-sets `base` from GitHub config (`/repo/` in CI, `/` in dev)
- Configures markdown on Astro's Sätteri processor: heading ids + heading self-link anchors, GitHub Flavored Markdown and smart typography
- Injects an adaptive Shiki theme that derives syntax colors from `--theme-hue` (based on Catppuccin, hue-rotated via OKLch). Override with `theme.shiki` to use fixed themes instead.
- Injects PostCSS preset-env (nesting, custom-media, media-query-ranges)
- When `meta.icon` is configured: generates favicons (svg, ico, 96x96 png), apple-touch-icon, webmanifest + manifest icons
- Injects sitemap, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/[slug].md` routes
- Serves `/og.png` (built-in satori template by default) and emits full OG + Twitter card meta tags; `summary_large_image` card when an image resolves
- Injects `/[...slug]` page rendering docs from the content collection (opt out with `docs.renderDefaultPage: false`)

## Components

### Core

Import from `astro-pigment/components`:

**Layout** -- full page shell: sticky header, sidebars, footer, code copy buttons. Config read from virtual module. Includes ThemeToggle, ThemeScript, CodeBlockWrapper automatically.

```astro
<Layout
  title="Page Title"
  navItems={[
    { href: "", label: "Home" },
    { href: "api", label: "API" },
  ]}
>
  <MyLogo slot="logo" />
  <TableOfContents
    slot="sidebar-right"
    headings={headings}
    itemsSelector=".prose :is(h2, h3)[id]"
  />
  <article class="prose"><slot /></article>
  <span slot="footer-extra">& My Company</span>
</Layout>
```

Props: `title`, `navLinks?` (array of `{ href, label, attrs? }`), `alternate?` (array of `{ type, title, href }` — adds `<link rel="alternate">` to `<head>`, plus a visually-hidden hint at the top of main when a `text/markdown` entry is present). Slots: `default`, `sidebar`, `sidebar-right`, `logo`, `head-extra`, `footer-extra`, `author-icon`.

Each sidebar renders only when its slot produces content, so a conditionally-passed one (`{cond && <TableOfContents slot="sidebar-right" ... />}`) collapses the column when the condition is false. Below the laptop breakpoint the rails become popovers; Layout scans the rendered sidebars for them and places their triggers as one floating `ButtonGroup` in the bottom-right corner.

**TableOfContents** -- scroll-spy sidebar plus its mobile popover, both rendered from a single component. Layout supplies the popover's floating trigger.

```astro
<TableOfContents slot="sidebar-right" headings={headings} itemsSelector=".prose :is(h2, h3)[id]" />
```

**PageHeading** -- heading row with an optional "view as markdown" icon link. Pair with `getMarkdownAlternate` from `astro-pigment/utils/urls` to reuse the same href on `Layout`'s `alternate` prop; omit `href` to hide the icon.

```astro
---
import { getMarkdownAlternate } from "astro-pigment/utils/urls";
const alt = getMarkdownAlternate("api");
---

<Layout title="API Reference" alternate={[alt]}>
  <PageHeading title="API Reference" href={alt.href} />
</Layout>
```

**Button** -- styled button with optional `square` prop for icon-only use.

```astro
<Button>Click me</Button>
<Button square aria-label="Menu"><Icon name="hamburger" /></Button>
```

**ButtonGroup** -- joins adjacent `Button`s into one segmented control: shared borders collapse and only the outer corners stay rounded. Pass `aria-label` to name the group.

```astro
<ButtonGroup aria-label="Page actions">
  <Button square aria-label="Copy page"><Icon name="copy" /></Button>
  <Button square aria-label="View as markdown"><Icon name="markdown" /></Button>
</ButtonGroup>
```

**Icon** -- built-in SVGs: `check`, `chevron-left`, `close`, `copy`, `github`, `hamburger`, `markdown`, `search`, `toc`, `x`. Use `name="custom"` + slot for your own.

```astro
<Icon name="github" size={32} />
<Icon name="custom" label="Mastodon"><svg>...</svg></Icon>
```

**Footer** -- license, GitHub, and author links from virtual config. Slot: `extra`. Included in Layout by default.

**ThemeToggle** -- three-state switcher (auto/light/dark). Included in Layout automatically.

**ThemeScript** -- inline script preventing FOUC. Included in Layout automatically.

**CodeBlockWrapper** -- adds copy buttons to all `.prose pre` blocks. Included in Layout automatically.

**InstallPackage** -- tabbed package manager switcher. Selection persists to localStorage.

```astro
<InstallPackage pkg="nanotags nanostores" />
<InstallPackage pkg="typescript" dev />
```

**PrevNextNav** -- previous/next page navigation.

```astro
<PrevNextNav prev={{ title: "Getting Started", href: "/" }} next={{ title: "API", href: "/api" }} />
```

### Playground

Import from `astro-pigment/components/playground`:

**CodeEditor** -- CodeMirror 6 with adaptive hue-based theme synced to dark mode.

```astro
<CodeEditor lang="javascript" />
```

**LivePreview** -- sandboxed iframe execution with console capture.

**CodeExample** -- full playground: tabbed editor + live preview + collapsible logs.

```astro
<CodeExample
  files={[
    { name: "index.html", type: "html", lang: "html", content: "<h1>Hello</h1>" },
    { name: "app.js", type: "javascript", lang: "javascript", content: "console.log('hi')" },
  ]}
/>
```

**CodePanels** -- multi-file code display with Shiki highlighting and tabs.

**ResizablePanes** / **ResizablePane** -- draggable split-pane layout.

**CollapsiblePane** -- expandable/collapsible section with resize handle.

**Tabs** / **Tab** -- accessible tabs with roving focus and scroll arrows.

## CSS Customization

The theme uses CSS variables with fallback defaults. Pass your CSS files via `theme.customCss` and override variables inside:

```js
docsTheme({
  theme: { customCss: ["./src/styles/custom.css"] },
});
```

```css
/* src/styles/custom.css */
:root {
  --layout-width-override: 1280px; /* wider layout */
  --layout-sidebar-width-override: 280px; /* left rail (section menu) */
  --layout-sidebar-width-right-override: 240px; /* right on-this-page rail */
}
```

For hue, use `theme.hue` and `theme.saturation` in the integration config (see above). `saturation` is a 0-100 multiplier applied to surfaces, text, accent, and border chromas (default 50 = current look, 0 = monochrome, 100 = 2x). Code syntax colors keep their own tuned chromas and follow the hue only.

### Available tokens

| Token                    | Light         | Dark          |
| ------------------------ | ------------- | ------------- |
| `--color-surface-1`      | 99% lightness | 12% lightness |
| `--color-surface-2`      | 98%           | 18%           |
| `--color-surface-3`      | 96%           | 21%           |
| `--color-accent`         | 55% lightness | 65% lightness |
| `--color-text-primary`   | 15%           | 90%           |
| `--color-text-secondary` | 40%           | 75%           |
| `--color-border`         | 90%           | 25%           |

Typography: `--text-xxs` (0.625rem) through `--text-2xl` (2rem). Spacing base: `--spacing` (4px). Radii: `--radius-sm`, `--radius-md`.

## Fonts

The integration auto-injects bundled Martian Grotesk (variable weight) and Martian Mono (400) as local fonts, setting `--font-sans` and `--font-mono` CSS variables. Pass `theme.fonts: false` to opt out and set those variables to your own fonts.

## Stores

Available from `astro-pigment/stores/theme` and `astro-pigment/stores/media`:

```ts
import { $themeSetting, $resolvedTheme, cycleTheme } from "astro-pigment/stores/theme";
import { $prefersDarkScheme, $prefersReducedMotion } from "astro-pigment/stores/media";
```

- `$themeSetting`: persistent atom (`"auto"` | `"light"` | `"dark"`)
- `$resolvedTheme`: computed (`"light"` | `"dark"`)
- `cycleTheme()`: cycles auto -> light -> dark

Package manager store (from `astro-pigment/stores/pkgManager`):

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

## SEO & LLM Endpoints

When `docs` is configured, the integration auto-generates:

- **`/llms.txt`**: structured index with project name, description, and per-doc sections
- **`/llms-full.txt`**: all docs concatenated into a single markdown file
- **`/[slug].md`**: individual markdown endpoints for each doc file
- **Sitemap**: via `@astrojs/sitemap`

## Edge Middleware

Every doc page ships a `.md` twin, but an agent landing on `/guide` doesn't know to ask for `/guide.md`. A static deploy has no server to negotiate, so the theme ships optional edge middleware: when a request's `Accept` header prefers markdown, it serves the prebuilt `.md` in place — same URL, `200`, `Content-Type: text/markdown`. Browsers keep getting HTML. Detection reads the standard `Accept` header, not AI-crawler User-Agents.

Add the entry file for your host and install its provider package (optional peer dependencies, so you only pull in the one you use). Each entry assumes Astro's default `base: "/"`; for a custom base, use the `create*Middleware({ base })` factory.

Each entry also scopes which requests reach the middleware. The core only negotiates paths whose last segment has no dot, and every config below mirrors that exact rule — so scoping never changes which pages negotiate, it only stops paying invocations to reach a no-op.

The config must be a **literal in your own file**. Vercel and Netlify both read it statically at build time and neither follows a re-export: Vercel ignores the matcher and runs on every request, Netlify never picks up the declaration. Both fail silently.

### Cloudflare Pages

No provider package needed; the prebuilt `.md` is served straight from the `ASSETS` binding.

```ts
// functions/_middleware.ts
export { onRequest } from "astro-pigment/edge/cloudflare";
```

Cloudflare can't express the rule directly, since `_routes.json` takes globs rather than regex, so it has to be enumerated. Put it in `public/` and Astro copies it into the build output:

```json
// public/_routes.json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_astro/*", "/*.html", "/*.md", "/*.txt", "/*.xml", "/*.json", "/*.png"]
}
```

Without it a root `_middleware.ts` matches every route, so nothing counts as static and the whole site draws on the Workers free plan's 100,000 requests/day — a budget shared across your entire account. The extensions are whatever your build emits (`find dist -type f`), and this is the one place the rule can drift: add a `.webp` and it silently starts invoking the middleware again.

### Netlify

Netlify supplies the runtime; `@netlify/edge-functions` is only needed for its types.

```ts
// netlify/edge-functions/markdown.ts
import type { Config } from "@netlify/edge-functions";

export { default } from "astro-pigment/edge/netlify";

export const config: Config = {
  path: "/*",
  excludedPattern: "/.*\\.[^/]*$",
};
```

### Vercel

Requires `@vercel/functions` at runtime for the pass-through.

```ts
// middleware.ts — project root
export { default } from "astro-pigment/edge/vercel";

export const config = {
  matcher: ["/((?!.*\\.[^/]*$).*)"],
};
```

### Other hosts

Deno Deploy, Workers with static assets, a custom Node/Bun server — wrap your static handler with `negotiateMarkdown` from `astro-pigment/edge`.

## Favicon & Webmanifest

The `meta.icon` option requires the [`sharp`](https://sharp.pixelplumbing.com/) package for raster image generation. Install it in your project:

```bash
pnpm add sharp
```

`meta.icon` accepts either a single source path or an object with two sources:

```js
// single source (same icon for all sizes)
meta: { icon: "src/assets/icon.svg" }

// two sources — simplified design for tiny favicons, detailed for manifest
meta: {
  icon: {
    favicon: "src/assets/favicon.svg",        // used for /favicon.svg and /favicon.ico (16-32px)
    manifest: "src/assets/icon-detailed.svg", // used for 96px and up
  },
}
```

Use the object form when a 512x512 design has fine details that become illegible at 16-32px. Both fields are required in the object form.

Generated routes:

- `/favicon.svg` — from `favicon` source (passthrough for SVG)
- `/favicon.ico` — from `favicon` source (32x32)
- `/favicon-96x96.png` — from `manifest` source
- `/apple-touch-icon.png` — from `manifest` source (180x180)
- `/web-app-manifest-192x192.png` — from `manifest` source
- `/web-app-manifest-512x512.png` — from `manifest` source
- `/site.webmanifest`

Layout renders the corresponding `<link>` tags only when `meta.icon` is set.

## Examples Loader

For sites with interactive code examples, import the content collection loader:

```ts
// content.config.ts
import { examplesLoader } from "astro-pigment/loaders/examples";

const examples = defineCollection({
  loader: examplesLoader("src/content/examples/"),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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

The loader parses `.html` files with `data-type` attributes into `FileEntry` arrays compatible with the `CodeExample` playground component.

## Exportable Configs

```js
// stylelint.config.js
export default { extends: ["astro-pigment/stylelint.config"] };
```

```
// .browserslistrc
extends astro-pigment/browserslist
```

## License

MIT
