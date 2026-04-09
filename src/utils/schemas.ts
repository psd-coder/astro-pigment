import { z } from "astro/zod";

export const docEntryDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export const docEntrySchema = z.looseObject({
  id: z.string(),
  collection: z.literal("docs"),
  data: docEntryDataSchema,
  filePath: z.string().optional(),
  body: z.string().optional(),
});
