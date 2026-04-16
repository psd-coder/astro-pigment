# Changelog

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

### Added

- `customCss` config option — pass an array of CSS file paths (relative to project root) to inject them into every page.

### Changed

- `hueSlider` config option renamed to `huePicker`. Update your `astro.config.mjs` accordingly.
- `HueSlider` component renamed to `HuePicker`. Update any direct imports from `astro-pigment/components`.
