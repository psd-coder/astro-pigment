import { parse, type Import } from "es-module-lexer";

/**
 * Relative and absolute specifiers a module loads at runtime, extracted with es-module-lexer so
 * comments, multiline imports, string literals and re-exports yield no false positives. Bare
 * specifiers (npm deps) and type-only imports are skipped: neither can bring a project CSS module
 * in.
 */
export function extractRelativeImports(source: string): string[] {
  let imports: ReadonlyArray<Import>;
  try {
    [imports] = parse(source);
  } catch {
    // A file the lexer cannot read contributes no CSS modules instead of failing the transform
    return [];
  }

  const specifiers: string[] = [];
  for (const imp of imports) {
    if (imp.type !== "dynamic" && imp.typeOnly) continue;
    const spec = imp.specifier;
    if (spec && (spec.startsWith(".") || spec.startsWith("/"))) specifiers.push(spec);
  }
  return specifiers;
}
