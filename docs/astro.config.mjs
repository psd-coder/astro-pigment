// @ts-check
import { defineConfig } from "astro/config";
import docsTheme from "astro-pigment";

export default defineConfig({
  site: "https://psd-coder.github.io",
  integrations: [
    docsTheme({
      project: {
        name: "astro-pigment",
        description:
          "Astro 6 documentation theme with dark mode, code highlighting, and built-in SEO and LLM-friendly endpoints",
        license: {
          name: "MIT",
          url: "https://github.com/psd-coder/astro-pigment/blob/main/LICENSE",
        },
        github: { user: "psd-coder", repository: "astro-pigment" },
      },
      author: { name: "Pavel Grinchenko", url: "https://x.com/psd_coder" },
      credits: [{ name: "Evil Martians", url: "https://evilmartians.com/" }],
      theme: {
        hue: 274,
      },
      meta: {
        icon: {
          favicon: "src/assets/astro-pigment-favicon.svg",
          manifest: "src/assets/astro-pigment.svg",
        },
        og: {
          image: {
            logo: "src/assets/astro-pigment-og-logo.png",
          },
        },
      },
      huePicker: true,
      search: true,
      docs: {
        navLinks: [
          { href: "/", label: "Overview" },
          { href: "/api", label: "API" },
          { href: "/components", label: "Components" },
          { href: "/theme-preview", label: "Theme Preview" },
        ],
      },
    }),
  ],
});
