// ---------------------------------------------------------------------------
// CSS Modules: scoped name generator + transitive import Vite plugin
//
// Problem: Astro's MDX content pipeline collects CSS only from the top-level
// .astro component that an .mdx file imports. CSS Modules referenced deeper in
// the tree (e.g. Tabs/styles.module.css used inside CodePanels.astro, which is
// used inside InstallPackage.astro) silently disappear from the rendered page.
//
// Solution: a Vite transform plugin that, for every .astro file, walks its
// import graph — through barrel .ts/.js re-exports — using es-module-lexer
// for correct import extraction, and collects all *.module.css paths it finds.
// It then prepends side-effect `import "…module.css"` lines to the compiled
// JS, which makes Vite's SSR module graph aware of those styles.
//
// Additionally, `generateScopedName` normalizes filenames before hashing so
// that the same CSS file always produces the same scoped class name regardless
// of Vite query suffixes (?inline in dev) or pnpm-link symlinks.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { init as esModuleLexerInit, parse as parseImports } from "es-module-lexer";

// ---------------------------------------------------------------------------
// generateScopedName
// ---------------------------------------------------------------------------

/**
 * Resolve a CSS module filename to its canonical real path, stripping Vite
 * query suffixes (e.g. `?inline`) first.
 *
 * Vite processes each CSS module multiple times under different `filename`
 * strings: once as-is and once with a ?inline query suffix (Astro dev mode).
 * Additionally, pnpm link creates symlinks, so the same file may arrive via
 * two filesystem paths. Without normalization each variant hashes to a
 * different scoped class name, and the HTML references one hash while the CSS
 * bundle contains another.
 */
function normalizeFilename(filename: string): string {
  const bare = filename.replace(/\?.*$/, "");
  try {
    return realpathSync(bare);
  } catch {
    return bare;
  }
}

/** Produce a scoped class name in the form `Dir__name_hash`. */
export function generateScopedName(name: string, filename: string): string {
  const real = normalizeFilename(filename);
  const dir = path.basename(path.dirname(real));
  const hash = createHash("sha256").update(`${real}:${name}`).digest("hex").slice(0, 5);
  return `${dir}__${name}_${hash}`;
}

// ---------------------------------------------------------------------------
// Transitive CSS Module collector (Vite plugin)
// ---------------------------------------------------------------------------

/** File extensions the walker will read and recurse into. */
const WALKABLE_EXTS = new Set([".astro", ".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);

/** Matches .astro frontmatter (the code block between --- fences). */
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

type ResolveFn = (
  source: string,
  importer: string,
) => Promise<{
  id: string;
  external?: boolean | "absolute" | "relative";
} | null>;
type AddWatchFileFn = (id: string) => void;

type CollectCssOpts = {
  /** Absolute path of the file to start walking from. */
  fileId: string;
  /** Vite's `this.resolve` — resolves import specifiers to absolute paths. */
  resolve: ResolveFn;
  /** Vite's `this.addWatchFile` — registers files for HMR invalidation. */
  addWatchFile: AddWatchFileFn;
  /** Accumulator: absolute paths of discovered *.module.css files. */
  cssModules: Set<string>;
  /** Cycle guard: absolute paths already visited in this walk. */
  visited: Set<string>;
};

/**
 * Recursively walk the import graph starting from `opts.fileId`, collecting
 * every *.module.css path found along the way.
 *
 * Uses `es-module-lexer` for correct import extraction — handles comments,
 * multiline imports, string literals, and re-exports without false positives.
 *
 * - For .astro files, only the frontmatter section is parsed (template
 *   imports are irrelevant since they can't reference CSS modules).
 * - For .ts/.js files (barrel re-exports), the entire file is parsed.
 * - Bare specifiers (npm packages) are skipped; only "./" and "/" imports
 *   are followed, so the walk stays within the project.
 * - `addWatchFile` registers each visited file for HMR — if a child adds or
 *   removes a CSS import, the parent's transform reruns.
 */
async function collectTransitiveCssModules(opts: CollectCssOpts): Promise<void> {
  const { fileId, resolve, addWatchFile, cssModules, visited } = opts;

  if (visited.has(fileId)) return;
  visited.add(fileId);
  addWatchFile(fileId);

  const ext = path.extname(fileId);
  if (!WALKABLE_EXTS.has(ext)) return;

  let source: string;
  try {
    source = await readFile(fileId, "utf-8");
  } catch {
    return;
  }

  // For .astro, only look at the frontmatter — that's where imports live.
  if (ext === ".astro") {
    const fm = FRONTMATTER_RE.exec(source);
    if (!fm || !fm[1]) return;
    source = fm[1];
  }

  // Use es-module-lexer for correct import extraction — handles comments,
  // multiline imports, string literals, and re-exports without false positives.
  await esModuleLexerInit;
  const [imports] = parseImports(source);

  for (const imp of imports) {
    // imp.n is the resolved specifier string; undefined for dynamic non-string expressions.
    const spec = imp.n;
    if (!spec) continue;
    // Only follow relative/absolute paths; skip bare specifiers (npm deps).
    if (!spec.startsWith(".") && !spec.startsWith("/")) continue;

    const resolved = await resolve(spec, fileId);
    if (!resolved || resolved.external) continue;
    const id = resolved.id;
    if (id.includes("/node_modules/")) continue;

    if (id.endsWith(".module.css")) {
      cssModules.add(id);
      continue;
    }
    await collectTransitiveCssModules({ ...opts, fileId: id });
  }
}

/**
 * Vite plugin that injects transitive CSS module imports into .astro files.
 *
 * `enforce: "post"` ensures we run after Astro's own compiler transform, so
 * `code` is already compiled JS and our prepended import lines become part of
 * the module's dependency graph.
 */
export function transitiveCssPlugin() {
  return {
    name: "astro-pigment-transitive-astro-css",
    enforce: "post" as const,
    async transform(
      this: { resolve: ResolveFn; addWatchFile: AddWatchFileFn },
      code: string,
      id: string,
    ) {
      if (!id.endsWith(".astro")) return undefined;

      const cssModules = new Set<string>();
      await collectTransitiveCssModules({
        fileId: id,
        // Bind Vite's PluginContext methods for the recursive walker.
        resolve: (s, i) => this.resolve(s, i),
        addWatchFile: (f) => this.addWatchFile(f),
        cssModules,
        visited: new Set<string>(),
      });

      if (cssModules.size === 0) return undefined;

      // Prepend side-effect imports so Vite's SSR module graph
      // includes these CSS files when building the page.
      const injected = [...cssModules].map((p) => `import ${JSON.stringify(p)};`).join("\n");
      return { code: `${injected}\n${code}`, map: null };
    },
  };
}
