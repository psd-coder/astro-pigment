import type { APIRoute } from "astro";
import { siteConfig } from "virtual:theme-integration-config";

const base = import.meta.env.BASE_URL;

export const GET: APIRoute = () => {
  const manifest = {
    name: siteConfig.project.name,
    short_name: siteConfig.project.name,
    icons: [
      {
        src: `${base}web-app-manifest-192x192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${base}web-app-manifest-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};
