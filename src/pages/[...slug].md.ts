import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { docsConfig } from "virtual:theme-integration-config";
import { readDocFile } from "../utils/markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection("docs");
  return docs.map((doc: { id: string }) => ({ params: { slug: doc.id } }));
};

export const GET: APIRoute = ({ params }) => {
  return new Response(readDocFile(docsConfig!.directory, params.slug!), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
