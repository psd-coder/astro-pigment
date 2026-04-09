import { z } from "astro/zod";
import { getCollection } from "astro:content";
import { docEntrySchema } from "./schemas";

export async function getDocsCollection() {
  const docs = await getCollection("docs");
  const parsedDocs = z.array(docEntrySchema).parse(docs);

  return parsedDocs.sort((a, b) => a.data.order - b.data.order);
}
