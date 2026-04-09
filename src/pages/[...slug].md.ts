import type { APIRoute, GetStaticPaths } from "astro";
import { docsConfig } from "virtual:theme-integration-config";
import { getDocsCollection } from "../utils/content";
import { readDocFile } from "../utils/markdown";
import { markdownResponse } from "../utils/response";

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getDocsCollection();
  return docs.map((doc: { id: string }) => ({ params: { slug: doc.id } }));
};

export const GET: APIRoute = ({ params }) => {
  return markdownResponse(readDocFile(docsConfig!.directory, params.slug!));
};
