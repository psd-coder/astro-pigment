import { docEntryDataSchema } from "@psd-coder/astro-docs-theme/utils/schemas";
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/docs" }),
  schema: docEntryDataSchema
});

export const collections = { docs };
