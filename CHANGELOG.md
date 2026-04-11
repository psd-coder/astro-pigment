# Changelog

## 0.10.1

### Fixed

- Added missing `repository` field to `package.json`, required for npm sigstore provenance verification.

## 0.10.0

### Added

- `customCss` config option — pass an array of CSS file paths (relative to project root) to inject them into every page.

### Changed

- `hueSlider` config option renamed to `huePicker`. Update your `astro.config.mjs` accordingly.
- `HueSlider` component renamed to `HuePicker`. Update any direct imports from `astro-pigment/components`.
