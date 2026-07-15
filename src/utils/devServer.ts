import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * In dev, the Astro toolbar (and other Vite-internal runtime modules) request a
 * companion source map under the `/@id/` prefix, e.g.
 * `/@id/astro/runtime/client/dev-toolbar/…__js.js.map`. Vite serves no standalone
 * map for these virtual module IDs, so the request falls through to Astro's dev
 * router, matches the catch-all `[...slug]` route, and logs a noisy
 * `getStaticPaths()` "no matching static path" warning on every request.
 *
 * These `.map` requests are never page content, so a 404 is the correct response
 * (and already what the router returns after warning). Detect them so the dev
 * middleware can answer directly, before the router ever sees them.
 */
export function isInternalSourcemapRequest(url: string | undefined): boolean {
  if (!url) return false;

  let pathname: string;
  try {
    pathname = new URL(url, "http://localhost").pathname;
  } catch {
    return false;
  }

  return pathname.startsWith("/@id/") && pathname.endsWith(".map");
}

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void;

type DevServerLike = { middlewares: { use: (handler: Middleware) => void } };

/**
 * Dev-only Vite plugin that answers Vite-internal source map requests with a 404
 * before Astro's route matcher can warn about them. See
 * {@link isInternalSourcemapRequest}.
 */
export function internalSourcemapNoiseFilter() {
  return {
    name: "astro-pigment-dev-sourcemap-noise-filter",
    apply: "serve" as const,
    configureServer(server: DevServerLike) {
      server.middlewares.use((req, res, next) => {
        if (isInternalSourcemapRequest(req.url)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        next();
      });
    },
  };
}
