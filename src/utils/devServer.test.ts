import { describe, expect, it } from "vitest";
import { isInternalSourcemapRequest } from "./devServer";

describe("isInternalSourcemapRequest", () => {
  it("matches the dev-toolbar entrypoint source map", () => {
    expect(
      isInternalSourcemapRequest(
        "/@id/astro/runtime/client/dev-toolbar/astro_runtime_client_dev-toolbar_entrypoint__js.js.map",
      ),
    ).toBe(true);
  });

  it("matches any /@id/ module source map, ignoring the query string", () => {
    expect(isInternalSourcemapRequest("/@id/some/module.js.map?v=abc123")).toBe(true);
  });

  it("ignores /@id/ requests that are not source maps", () => {
    expect(isInternalSourcemapRequest("/@id/astro/runtime/client/dev-toolbar/entrypoint.js")).toBe(
      false,
    );
  });

  it("ignores real page paths that end with .map", () => {
    expect(isInternalSourcemapRequest("/docs/site.map")).toBe(false);
  });

  it("ignores /@fs/ source maps, which may be real files on disk", () => {
    expect(isInternalSourcemapRequest("/@fs/Users/x/project/foo.js.map")).toBe(false);
  });

  it("returns false for undefined or malformed urls", () => {
    expect(isInternalSourcemapRequest(undefined)).toBe(false);
    expect(isInternalSourcemapRequest("")).toBe(false);
  });
});
