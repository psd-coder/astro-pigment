// @ts-check
import { defineConfig } from "astro/config";
import docsTheme from "astro-pigment";

export default defineConfig({
  integrations: [
    docsTheme({
      project: {
        name: "astro-pigment",
        description:
          "Astro 6 documentation theme with dark mode, interactive playgrounds, and SEO endpoints.",
        license: {
          name: "MIT",
          url: "https://github.com/psd-coder/astro-pigment/blob/main/LICENSE",
        },
        github: { user: "psd-coder", repository: "astro-pigment" },
      },
      author: { name: "Pavel Grinchenko", url: "https://x.com/psd_coder" },
      credits: [{ name: "Evil Martians", url: "https://evilmartians.com/" }],
      icon: {
        favicon: "src/assets/astro-pigment-favicon.svg",
        manifest: "src/assets/astro-pigment.svg",
      },
      hueSlider: true,
      search: true,
      navLinks: [
        { href: "/", label: "Overview" },
        { href: "/api", label: "API" },
        { href: "/components", label: "Components" },
        { href: "/theme-preview", label: "Theme Preview" },
      ],
    }),
  ],
});
