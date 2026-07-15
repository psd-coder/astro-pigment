import type { Config, Context } from "@netlify/edge-functions";
import { negotiateMarkdown, type MarkdownNegotiationOptions } from "./core";

/**
 * Excludes any path whose last segment holds a dot, mirroring the core's own no-op rule so
 * scoping never changes which paths negotiate - it only stops paying to reach a no-op.
 * Netlify reads this statically, so consumers must copy the literal into their own edge
 * function; a renamed or re-exported config is not picked up.
 */
export const config: Config = {
  path: "/*",
  excludedPattern: "/.*\\.[^/]*$",
};

export function createNetlifyMiddleware(options?: MarkdownNegotiationOptions) {
  return (request: Request, context: Context): Promise<Response> =>
    negotiateMarkdown(request, () => context.next(), options);
}

export default createNetlifyMiddleware();
