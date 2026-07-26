import { z } from "astro/zod";
import { getCollection } from "astro:content";
import { docEntrySchema } from "./schemas";
import { getHref, getRouteSlug } from "./urls";

export async function getDocsCollection() {
  const docs = await getCollection("docs");
  const parsedDocs = z.array(docEntrySchema).parse(docs);

  return parsedDocs.sort((a, b) => a.data.order - b.data.order);
}

export type DocEntry = Awaited<ReturnType<typeof getDocsCollection>>[number];

export type DocPageProps = {
  doc: DocEntry;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
};

// A page's `menu: "<id>"` must name a real menu entry. getEntry would otherwise
// return undefined at render and ship a reserved-but-empty sidebar column, so
// catch the dangling reference at build instead.
async function assertMenuRefsResolve(docs: DocEntry[]) {
  const menus: { id: string }[] = await getCollection("menu");
  const menuIds = new Set(menus.map((menu) => menu.id));
  const unresolved = docs.filter((doc) => doc.data.menu && !menuIds.has(doc.data.menu));
  if (unresolved.length > 0) {
    const lines = unresolved
      .map((doc) => `  page "${doc.id}" → menu "${doc.data.menu}"`)
      .join("\n");
    throw new Error(`[astro-pigment] menu references a menu that does not exist:\n${lines}`);
  }
}

// getRouteSlug collapses `*/index` to its parent, so `api` and `api/index`
// both resolve to `api`. Astro silently keeps the last of two identical paths,
// so reject the collision at build with both source ids.
function assertUniqueRouteSlugs(docs: DocEntry[]) {
  const bySlug = new Map<string | undefined, string[]>();
  for (const doc of docs) {
    const slug = getRouteSlug(doc.id);
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), doc.id]);
  }
  const collisions = [...bySlug].filter(([, ids]) => ids.length > 1);
  if (collisions.length > 0) {
    const lines = collisions
      .map(([slug, ids]) => `  route slug "${slug ?? ""}" ← ${ids.join(", ")}`)
      .join("\n");
    throw new Error(`[astro-pigment] docs pages resolve to the same route:\n${lines}`);
  }
}

export async function getDocsStaticPaths() {
  const docs = await getDocsCollection();
  assertUniqueRouteSlugs(docs);
  await assertMenuRefsResolve(docs);

  return docs.map((doc, i) => {
    const prev = docs[i - 1];
    const next = docs[i + 1];
    const props: DocPageProps = {
      doc,
      prev: prev ? { title: prev.data.title, href: getHref(prev.id) } : undefined,
      next: next ? { title: next.data.title, href: getHref(next.id) } : undefined,
    };

    return {
      params: { slug: getRouteSlug(doc.id) },
      props,
    };
  });
}
