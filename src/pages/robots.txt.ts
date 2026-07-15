import type { APIRoute } from "astro";
import { robots } from "virtual:pigment-config";

function yesNo(value: boolean): "yes" | "no" {
  return value ? "yes" : "no";
}

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const path = `${base}sitemap-index.xml`.replace(/\/{2,}/g, "/");
  const sitemapUrl = site ? new URL(path, site).href : path;
  const { search, aiTrain, aiInput } = robots.contentSignal;
  const body = [
    "User-agent: *",
    `Content-Signal: search=${yesNo(search)}, ai-train=${yesNo(aiTrain)}, ai-input=${yesNo(aiInput)}`,
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
