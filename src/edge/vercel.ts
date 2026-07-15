import { next } from "@vercel/functions";
import { negotiateMarkdown, type MarkdownNegotiationOptions } from "./core";

/**
 * Skips any path whose last segment holds a dot, mirroring the core's own no-op rule so
 * scoping never changes which paths negotiate - it only stops paying to reach a no-op.
 * Vercel reads this statically, so consumers must copy the literal into their own
 * `middleware.ts`; a re-export is silently ignored and the matcher stops applying.
 */
export const config = {
  matcher: ["/((?!.*\\.[^/]*$).*)"],
};

export function createVercelMiddleware(options?: MarkdownNegotiationOptions) {
  return (request: Request): Promise<Response> => negotiateMarkdown(request, () => next(), options);
}

export default createVercelMiddleware();
