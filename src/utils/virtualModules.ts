export function virtualReexportDefault(opts: {
  filePath: string;
  exportName: string;
  resolveCallable?: boolean;
}): string {
  const lines = [`import __m from ${JSON.stringify(opts.filePath)};`];
  if (opts.resolveCallable) {
    lines.push(
      `const __raw = typeof __m === "function" ? await __m() : __m;`,
      `export const ${opts.exportName} = __raw;`,
    );
  } else {
    lines.push(`export const ${opts.exportName} = __m;`);
  }
  return lines.join("\n");
}

export function buildConfigModule(values: Record<string, unknown>): string {
  return Object.entries(values)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
    .join("\n");
}
