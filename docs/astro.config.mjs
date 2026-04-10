// @ts-check
import { defineConfig } from "astro/config";
import docsTheme, { fonts } from "@psd-coder/astro-pigment";

export default defineConfig({
  integrations: [
    docsTheme({
      project: {
        name: "Pigment",
        description:
          "Astro 6 documentation theme with dark mode, interactive playgrounds, and SEO endpoints.",
        license: {
          name: "MIT",
          url: "https://github.com/psd-coder/astro-pigment/blob/main/LICENSE",
        },
        github: { user: "psd-coder", repository: "astro-pigment" },
      },
      author: { name: "Pavel Grinchenko", url: "https://x.com/psd_coder" },
      icon: "src/assets/icon.svg",
      hueSlider: true,
      search: true,
      docs: { directory: "src/content/docs" },
    }),
  ],
  fonts: fonts(),
});
