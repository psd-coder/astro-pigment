import { prefersMarkdown } from "../utils/accept";

export type MarkdownNegotiationOptions = {
  /** Site base path, matching Astro's `base` config. Default: "/". */
  base?: string;
  /**
   * Override how the prebuilt `.md` asset is fetched. Defaults to a plain
   * same-origin `fetch`. Cloudflare passes `env.ASSETS.fetch` here.
   */
  fetchAsset?: (url: URL) => Promise<Response>;
};

/**
 * Pure content-negotiation decision: the prebuilt `.md` asset URL to serve for
 * this request, or null when negotiation does not apply (wrong method, HTML
 * preferred, or the path already targets a file).
 */
export function markdownAssetUrl(
  request: Request,
  options: MarkdownNegotiationOptions = {},
): URL | null {
  if (request.method !== "GET") return null;
  if (!prefersMarkdown(request.headers.get("accept"))) return null;

  const url = new URL(request.url);
  const lastSegment = url.pathname.split("/").pop() ?? "";
  // A dot in the last segment means a file (.md, .css, images, …). Skipping it
  // also makes a fetched `/x.md` re-entering the handler a no-op (loop-safe).
  if (lastSegment.includes(".")) return null;

  const base = (options.base ?? "/").replace(/\/$/, "");
  const path = url.pathname.replace(/\/+$/, "");
  const target = path === "" || path === base ? `${base}/index.md` : `${path}.md`;

  const assetUrl = new URL(url.href);
  assetUrl.pathname = target.replace(/\/{2,}/g, "/");
  assetUrl.search = "";
  return assetUrl;
}

/**
 * Serve the prebuilt markdown asset in place (200, same URL) when the client
 * prefers markdown; otherwise pass through to the original response. Provider
 * agnostic: keyed on the standard `Accept` header, not AI crawler User-Agents.
 */
export async function negotiateMarkdown(
  request: Request,
  passthrough: () => Response | Promise<Response>,
  options: MarkdownNegotiationOptions = {},
): Promise<Response> {
  const target = markdownAssetUrl(request, options);
  if (!target) return passthrough();

  const fetchAsset =
    options.fetchAsset ?? ((url: URL) => fetch(url, { headers: { accept: "text/markdown" } }));
  const asset = await fetchAsset(target);
  // A missing `.md` (non-doc path) falls back to the original HTML.
  if (!asset.ok) return passthrough();

  const response = new Response(asset.body, asset);
  response.headers.set("content-type", "text/markdown; charset=utf-8");
  response.headers.set("vary", "accept");
  return response;
}
