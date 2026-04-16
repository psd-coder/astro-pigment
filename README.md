# astro-pigment

An Astro 6 documentation theme with dark mode, interactive playgrounds, and SEO endpoints. One integration call gives you a complete docs site: layout, navigation, table of contents, code highlighting, LLM-friendly endpoints, and a library of interactive components.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

- **Single integration**: rehype plugins, PostCSS, Shiki themes, sitemap, and SEO routes configured automatically
- **Dark mode**: three-state toggle (auto/light/dark) with View Transitions, no FOUC
- **CSS variable theming**: override `--theme-hue-override` or `--layout-width-override` in plain CSS, no config options needed
- **Interactive playgrounds**: CodeMirror editor + sandboxed live preview with console capture
- **LLM endpoints**: `/llms.txt` and `/llms-full.txt` auto-generated from your markdown content
- **Auto-generated favicons**: provide one or two source icons (simplified favicon + detailed manifest), get favicon.ico, SVG, PNG, apple-touch-icon, and webmanifest
- **Bundled fonts**: Martian Grotesk + Martian Mono auto-injected (opt out with `fonts: false`)
- **Accessible**: roving focus, ARIA attributes, keyboard navigation throughout
- **Zero build step**: Astro resolves `.astro`/`.ts` source directly from the package

## Installation

Add the theme as a GitHub dependency along with its peer dependencies:

```json
// package.json
{
  "dependencies": {
    "astro-pigment": "github:psd-coder/astro-pigment",
    "astro": "^6.0.0",
    "nanotags": "^0.14.0",
    "nanostores": "^1.0.0"
  }
}
```

Then install:

```bash
pnpm install
```

## Quick Start

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import docsTheme from "astro-pigment";

export default defineConfig({
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
      icon: "src/assets/icon.svg",
      navLinks: [
        { href: "/", label: "Overview" },
        { href: "/api", label: "API" },
      ],
    }),
  ],
});
```

```ts
// src/content.config.ts
import { defineDocsCollections } from "astro-pigment/content";

export const collections = defineDocsCollections();
```

Drop your `.md`/`.mdx` files in `src/content/docs/`. The integration injects `/[...slug]` automatically; pages render with the full layout, TOC, prev/next navigation, and edit-on-github link out of the box. Dark mode, sticky header, sidebar + mobile TOC, code copy buttons, favicons, webmanifest, sitemap, and LLM endpoints are all wired up automatically.

To render pages yourself, set `docs.renderDefaultPage: false` and create your own `src/pages/[...slug].astro`. Reuse the boilerplate via `getDocsStaticPaths` from `astro-pigment/utils/content`.

### Pick a theme hue (optional)

Temporarily enable the hue slider to find the right color for your site:

```js
docsTheme({
  // ...your config
  huePicker: true, // shows a color slider in the header
});
```

Drag the slider, pick a hue you like, then hardcode it in CSS and remove `huePicker`:

```css
:root {
  --theme-hue-override: 135; /* the value you picked */
}
```

All UI and code syntax highlighting colors derive from this hue via OKLch.

## Integration Config

```ts
type DocsThemeConfig = {
  // Required
  github: {
    user?: string; // one of user/organization required
    organization?: string;
    repository: string;
  };
  project: {
    name: string;
    description: string;
    license: { name: string; url: string };
  };
  author: {
    name: string;
    url: string;
    icon?: IconName; // auto-detected: "x" for x.com URLs
  };

  // Optional
  links?: Array<{ label: string; url: string; icon?: IconName }>;
  site?: string; // default: auto GitHub Pages URL
  icon?: string; // path to 512x512 PNG or SVG, generates favicons + webmanifest
  huePicker?: boolean; // show hue slider in header for initial theme setup
  shikiThemes?: {
    // overrides adaptive hue-based theme
    light: string;
    dark: string;
  };
  customCss?: string[]; // CSS files injected into every page, paths relative to project root
  navLinks?: NavItem[]; // header nav links; href accepts "/api" or "api"
  docs?: {
    directory?: string; // default: "src/content/docs"
    pattern?: string; // default: "**/*.{md,mdx}"
    deepSections?: string[]; // slugs where llms.txt shows ### headings
    renderDefaultPage?: boolean; // default: true. set false to ship your own [...slug].astro
    tocItemsSelector?: string; // default: ".prose :is(h2, h3)[id]"
  };
};
```

### What the integration does

- Stores config in a virtual module (`virtual:theme-integration-config`) so components read it automatically
- Auto-sets `site` and `base` from GitHub config (GitHub Pages URL in CI, `/` in dev)
- Injects rehype-slug + rehype-autolink-headings
- Injects an adaptive Shiki theme that derives syntax colors from `--theme-hue` (based on Catppuccin, hue-rotated via OKLch). Override with `shikiThemes` to use fixed themes instead.
- Injects PostCSS preset-env (nesting, custom-media, media-query-ranges)
- When `icon` is configured: generates favicons (svg, ico, 96x96 png), apple-touch-icon, webmanifest + manifest icons
- Injects sitemap + llms.txt, llms-full.txt, [slug].md routes
- Injects `/[...slug]` page rendering docs from the content collection (opt out with `docs.renderDefaultPage: false`)

## Components

### Core

Import from `astro-pigment/components`:

**Layout** -- full page shell: sticky header, sidebar, footer, code copy buttons. Config read from virtual module. Includes ThemeToggle, ThemeScript, CodeBlockWrapper automatically.

```astro
<Layout
  title="Page Title"
  navItems={[
    { href: "", label: "Home" },
    { href: "api", label: "API" },
  ]}
>
  <MyLogo slot="logo" />
  <TableOfContents slot="sidebar" headings={headings} itemsSelector=".prose :is(h2, h3)[id]" />
  <article class="prose"><slot /></article>
  <span slot="footer-extra">& My Company</span>
</Layout>
```

Props: `title`, `navItems?`. Slots: `default`, `sidebar`, `logo`, `head-extra`, `footer-extra`, `author-icon`.

**TableOfContents** -- desktop sidebar with scroll-spy highlighting + mobile popover trigger. Both rendered from a single component.

```astro
<TableOfContents slot="sidebar" headings={headings} itemsSelector=".prose :is(h2, h3)[id]" />
```

**PageHeading** -- heading row with a "view as markdown" icon link.

```astro
<PageHeading title="API Reference" href="/api.md" />
```

**Button** -- styled button with optional `square` prop for icon-only use.

```astro
<Button>Click me</Button>
<Button square aria-label="Menu"><Icon name="list" /></Button>
```

**Icon** -- built-in SVGs: `check`, `chevron-left`, `copy`, `github`, `list`, `markdown`, `x`. Use `name="custom"` + slot for your own.

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

The theme uses CSS variables with fallback defaults. Pass your CSS files via `customCss` and override variables inside:

```js
docsTheme({
  customCss: ["./src/styles/custom.css"],
});
```

```css
/* src/styles/custom.css */
:root {
  --theme-hue-override: 135; /* green instead of default cyan (180) */
  --layout-width-override: 1280px; /* wider layout */
  --layout-sidebar-width-override: 280px;
}
```

All color tokens are derived from `--theme-hue` using OKLch, so changing the hue recolors the entire site.

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

The integration auto-injects bundled Martian Grotesk (variable weight) and Martian Mono (400) as local fonts, setting `--font-sans` and `--font-mono` CSS variables. Pass `fonts: false` to opt out and set those variables to your own fonts.

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

## Favicon & Webmanifest

`icon` accepts either a single source path or an object with two sources:

```js
// single source (same icon for all sizes)
icon: "src/assets/icon.svg",

// two sources — simplified design for tiny favicons, detailed for manifest
icon: {
  favicon: "src/assets/favicon.svg",      // used for /favicon.svg and /favicon.ico (16-32px)
  manifest: "src/assets/icon-detailed.svg", // used for 96px and up
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

Layout renders the corresponding `<link>` tags only when `icon` is set.

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
