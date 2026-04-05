// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import docsTheme, { fonts } from "@psd-coder/astro-docs-theme";

export default defineConfig({
  integrations: [
    mdx(),
    docsTheme({
      github: { user: "psd-coder", repository: "astro-docs-theme" },
      project: {
        name: "astro-docs-theme",
        description:
          "Astro 6 documentation theme with dark mode, interactive playgrounds, and SEO endpoints.",
        license: {
          name: "MIT",
          url: "https://github.com/psd-coder/astro-docs-theme/blob/main/LICENSE",
        },
      },
      author: { name: "Pavel Grinchenko", url: "https://x.com/psd_coder" },
      icon: "src/assets/icon.svg",
      docs: { directory: "src/content/docs" },
    }),
  ],
  fonts: fonts(),
});
