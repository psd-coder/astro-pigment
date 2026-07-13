import remarkGfm from "remark-gfm";

// GitHub Flavored Markdown + typography settings for the theme's markdown pipeline, spread into
// the inline `markdown` config in the integration.
//
// The theme replaces Astro's `markdown` config wholesale and injects `@astrojs/mdx` itself.
// Astro normally auto-adds remark-gfm via the `markdown.gfm` default, but that default is not
// guaranteed to survive a custom `markdown` config into the MDX pipeline across Astro/MDX
// versions, so GFM (tables, strikethrough, task lists) silently dies in `.mdx` pages.
//
// Fix: add remark-gfm explicitly (a direct dependency, independent of whatever Astro bundles)
// and set `gfm: false` so Astro's built-in copy doesn't also run, so remark-gfm applies exactly
// once for both `.md` and `.mdx`. `smartypants` is kept on explicitly for the same reason: so
// the typography default survives the custom config.
export const gfmMarkdownConfig = {
  gfm: false,
  // On, with default options. `{}` rather than `true` because Astro's resolved markdown type
  // accepts `false | SmartypantsOptions`, not the bare `true` shorthand; any object enables it.
  smartypants: {},
  remarkPlugins: [remarkGfm],
};
