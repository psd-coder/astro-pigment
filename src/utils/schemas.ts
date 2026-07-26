import { z } from "astro/zod";

export const docEntryDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  // Left column: a menu id renders that menu; omit for no left column.
  menu: z.string().optional(),
  // Right column: the on-this-page rail; false suppresses it.
  toc: z.boolean().default(true),
});

// Extra HTML attributes spread onto the rendered <a> (e.g. target, rel, data-*).
const linkAttrsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

const menuItemSchema = z.object({
  title: z.string(),
  href: z.string(),
  attrs: linkAttrsSchema.optional(),
});

const menuGroupSchema = z.object({
  // null → ungrouped: items render flat with no heading.
  label: z.string().nullable(),
  // A group heading can itself be a link (e.g. a section landing); omit for a
  // plain text heading. `items` may be empty for a standalone top-level link.
  href: z.string().optional(),
  attrs: linkAttrsSchema.optional(),
  items: z.array(menuItemSchema).default([]),
});

export const menuSchema = z.object({
  groups: z.array(menuGroupSchema),
});

export type MenuData = z.infer<typeof menuSchema>;
export type MenuGroup = z.infer<typeof menuGroupSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;

export const docEntrySchema = z.looseObject({
  id: z.string(),
  collection: z.literal("docs"),
  data: docEntryDataSchema,
  filePath: z.string().optional(),
  body: z.string().optional(),
});
