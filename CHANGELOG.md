# Changelog

## 0.20.2

### Fixed

- Make the search hotkey work on non-Latin keyboard layouts by matching the physical key as well as the printed character.

## 0.20.1

### Fixed

- Drop the guide line from the ToC list in the mobile popover, and restore the missing list item indent in the sidebar nav list.

## 0.20.0

### Breaking

- Astro 7 is now required: the `astro` peer range moves from `^6.0.0` to `^7.0.0`.
- The markdown pipeline runs on Astro 7's Sätteri processor, where GFM and smart typography are native features. Smart typography now reads `--` as an en dash and `---` as an em dash, where the previous smartypants mapping turned `--` into an em dash and left `---` alone.

### Added

- Index page descriptions as a search key, giving authors a place to put search terms the headings do not spell out.
- Query tokenizer and term-aware snippet extraction, so a multi-word query gets a snippet built around the terms that actually matched instead of a literal whole-query lookup.

### Fixed

- Rank search results by relevance instead of page order: pages rank by their best block and the tail is trimmed relative to that score. Also indexes the page title and requires every query word to match, so extra words narrow the results.
- Highlight every query term separately in results and on the page, instead of marking only a whole-query literal match.
- Chunk oversized sections in the search index at word boundaries, so one large section no longer skews ranking or yields snippets from anywhere inside it.
- Flatten markdown table rows into comma-separated cells so tables no longer reach search snippets as `|---|---|` soup.

### Documentation

- List sites built with the theme in the README.

## 0.19.0

### Breaking

- The page outline now always owns the right rail and the left rail is reserved for navigation. Icon `list` is renamed to `hamburger`, and `--layout-sidebar-width-override` sizes the left rail — size the outline with the new `--layout-sidebar-width-right-override`.
- The build fails on a dangling `menu` reference and on two pages resolving to the same route slug, instead of reserving an empty column or silently dropping a page.

### Added

- `menu` content collection (`defineMenuCollection`): a flat JSON navigation per file, its filename as id, opted into by a page's `menu: "<id>"` frontmatter. Paired with `toc` so each frontmatter field owns one column.
- Section menu rendered in the left rail, with linkable group headings and an active entry that re-centers in the rail only when off-screen.
- Mobile navigation and outline triggers share one `MobilePopover` and sit side by side as a single grouped control.
- `ButtonGroup` component: adjacent buttons collapse shared borders, keeping only the outer corners rounded.
- Morph the shell across client-side navigations, so the logo, extra-nav block, footer blocks, and left rail hold in place while only the content swaps.
- `isExternalHref` and `getRouteSlug` in `astro-pigment/utils/urls`, and `attrs` on nav and menu links for extra `<a>` attributes.

### Changed

- Active and current href matching is consolidated behind one path normalizer and is segment-aware, so `/guide` no longer marks `/guidelines` active, and `getHref` passes external hrefs through verbatim.

### Fixed

- Separate code comments from code text without losing AA contrast, by pulling `--code-text` forward instead of dimming the comment below the AA floor.

### Documentation

- Split the API reference into per-topic pages under Authoring, Configuration, and Deployment menu groups; the landing keeps the integration config object plus a map of the rest.
- Move the components reference to `/api/components` under the Reference menu group, picking up the section nav and three-column layout.
- Document the three-column layout, the new frontmatter fields, and the menu collection.

## 0.18.0

### Added

- Markdown twins: every doc is also built as a standalone `.md` file at a `.md`-suffixed URL (`/guide` → `/guide.md`).
- Opt-in Vercel, Netlify, and Cloudflare edge adapters serve those twins at the same URL via `Accept`-header negotiation (`negotiateMarkdown`, `markdownAssetUrl`, `prefersMarkdown`).
- `robots.contentSignal` config (`search`/`aiTrain`/`aiInput`, each default `true`) declaring Content-Signal permissions in `robots.txt`.
- Render `InstallPackage` as a per-package-manager command list in the markdown twin.
- Rework footer brand into a "made with Astro Pigment" credit.

### Fixed

- Meet WCAG AA color contrast in code syntax tokens and UI text across theme hues.
- Resolve header nav accessibility violations (menubar roles, `role="banner"`, logo link name).
- Remove `<base>` tag that broke in-page anchor links.
- Give heading permalinks real anchor text for SEO and accessibility.
- Sanitize inline SVG logos so `<foreignObject>` no longer breaks layout.
- Silence dev router warning from dev-toolbar source-map requests.

## 0.17.0

### Added

- Branded footer logo linking to the project site.
- Allow overriding `TableOfContents` sidebar width via the `--layout-sidebar-width-override` CSS variable.

### Fixed

- Render GFM tables, strikethrough, and task lists in `.mdx`.

### Documentation

- Drop hardcoded Astro major version from package descriptions.

## 0.16.1

### Fixed

- Adjust CodeExample styles.

## 0.16.0

### Breaking

- Theme picker now exposes a saturation axis. `theme` config accepts `saturation` (0-100) alongside `hue`; CSS scales chroma off it. `HuePicker` public export removed — folded into `ThemePicker`. Closing the picker copies `{ hue, saturation }` and flashes a "Theme copied" tooltip.
- Media query breakpoint custom properties renamed: `--min-mobiles`/`--min-tablets`/`--min-laptops` → `--min-tablets`/`--min-laptops`/`--min-desktop`. Min-width values offset by 1px to avoid overlap with matching max-width queries.

### Fixed

- Keep mobile TOC popover visible inside hidden sidebar aside by collapsing the aside with `display: contents` under `--tablets`.
- Prevent theme attr flash during `ClientRouter` swap by applying theme overrides on `astro:before-swap` to `event.newDocument`.

## 0.15.0

### Breaking

- `base` auto-derivation dropped; set `base` directly in `astro.config.mjs`. The integration no longer guesses it from GitHub Pages hostname + CI env and uses `astroConfig.base` directly.

## 0.14.0

### Breaking

- `site` removed from `DocsThemeConfig`; set it directly in `astro.config.mjs`. The integration throws at startup if missing. Astro freezes `Astro.url.origin` before integration hooks run, so `updateConfig({ site })` silently produced localhost in production canonical and OG URLs.

## 0.13.1

### Fixed

- Use `publicSiteUrl` origin for canonical and OG URLs.

## 0.13.0

### Breaking

- Config regrouped: `icon` → `meta.icon`, `fonts` → `theme.fonts`, `shikiThemes` → `theme.shiki`, `extraEntries` → `docs.extraEntries`.
- Virtual module IDs renamed: `virtual:theme-integration-config` → `virtual:pigment-config`, `virtual:theme-extra-entries` → `virtual:pigment-extra-entries`.

### Added

- OG image endpoint `/og.png` and Twitter image `/twitter-image.png` via Satori-based renderer.
- `/robots.txt` injected route.
- `theme.hue` config option.
- Bundled Martian Grotesk and Martian Mono fonts.

## 0.12.0

### Added

- Add alternate link support to Layout and make PageHeading href optional.

## 0.11.2

### Added

- Properly describe in the docs that icon & manifest features requires installed sharp package.

## 0.11.1

### Changed

- Expand package.json exports from wildcard to explicit paths.

## 0.11.0

### Added

- `extraEntries` config for injecting non-collection pages into search/llms/md routes
- Page title as fallback heading for untitled leading section
- Back link and `class` prop to `PageHeading`
- `rawBody` and `descriptionHtml` in example loader entries
- Search term highlighting on destination page
- `importOverrides` prop in `CodeExample` component

### Fixed

- Header height, code block padding, and surface colors

## 0.10.1

### Fixed

- Added missing `repository` field to `package.json`, required for npm sigstore provenance verification.

## 0.10.0

### Breaking

- `hueSlider` config option renamed to `huePicker`. Update your `astro.config.mjs` accordingly.
- `HueSlider` component renamed to `HuePicker`. Update any direct imports from `astro-pigment/components`.

### Added

- `customCss` config option — pass an array of CSS file paths (relative to project root) to inject them into every page.
