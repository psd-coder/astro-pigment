import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { docs } from "virtual:pigment-config";
import { docEntryDataSchema, menuSchema } from "./utils/schemas";

export function defineDocsCollections() {
  return {
    docs: defineCollection({
      loader: glob({
        pattern: "**/*.{md,mdx}",
        base: docs.directory,
      }),
      schema: docEntryDataSchema,
    }),
  };
}

// Reusable flat navigations as JSON; entry id = filename, referenced by a page's
// `menu: "<id>"`. No virtual-config option — the directory is fixed.
export function defineMenuCollection() {
  return {
    menu: defineCollection({
      loader: glob({
        pattern: "**/*.json",
        base: "src/content/menu",
      }),
      schema: menuSchema,
    }),
  };
}
