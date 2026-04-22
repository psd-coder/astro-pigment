# Changelog

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
