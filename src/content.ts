import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { docs } from "virtual:pigment-config";
import { docEntryDataSchema } from "./utils/schemas";

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
