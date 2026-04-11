import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { docsConfig } from "virtual:theme-integration-config";
import { docEntryDataSchema } from "./utils/schemas";

export function defineDocsCollections() {
  return {
    docs: defineCollection({
      loader: glob({
        pattern: "**/*.{md,mdx}",
        base: docsConfig.directory,
      }),
      schema: docEntryDataSchema,
    }),
  };
}
