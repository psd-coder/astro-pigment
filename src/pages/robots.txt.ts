import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const path = `${base}sitemap-index.xml`.replace(/\/{2,}/g, "/");
  const sitemapUrl = site ? new URL(path, site).href : path;
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl}`, ""].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
