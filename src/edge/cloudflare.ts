import { negotiateMarkdown, type MarkdownNegotiationOptions } from "./core";

/** Minimal structural type for the Cloudflare Pages Functions context (avoids a workers-types dep). */
type PagesFunctionContext = {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (input: URL) => Promise<Response> } };
};

export function createCloudflareMiddleware(options?: MarkdownNegotiationOptions) {
  return (context: PagesFunctionContext): Promise<Response> =>
    negotiateMarkdown(context.request, () => context.next(), {
      ...options,
      // Serve the prebuilt `.md` straight from the asset binding, no extra network hop.
      fetchAsset: options?.fetchAsset ?? ((url) => context.env.ASSETS.fetch(url)),
    });
}

export const onRequest = createCloudflareMiddleware();
