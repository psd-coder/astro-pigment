import path from "node:path";
import type { OgImageSource } from "../types";

export type ImageConfig =
  | { mode: "none" }
  | { mode: "file"; filePath: string }
  | {
      mode: "auto" | "template";
      templatePath: string | null;
      logoPath: string | null;
      title: string;
      description: string;
    };

export function resolveImageSource(
  source: OgImageSource | undefined,
  astroRoot: string,
  logoFallback: string | null,
  defaultTitle: string,
  defaultDescription: string,
): ImageConfig {
  if (source === undefined || source === true) {
    return {
      mode: "auto",
      templatePath: null,
      logoPath: logoFallback,
      title: defaultTitle,
      description: defaultDescription,
    };
  }

  if (typeof source === "string") {
    return { mode: "file", filePath: path.resolve(astroRoot, source) };
  }

  const logoPath =
    source.logo === false
      ? null
      : typeof source.logo === "string"
        ? path.resolve(astroRoot, source.logo)
        : logoFallback;
  const title = source.title ?? defaultTitle;
  const description = source.description ?? defaultDescription;

  return {
    mode: source.template ? "template" : "auto",
    templatePath: source.template ? path.resolve(astroRoot, source.template) : null,
    logoPath,
    title,
    description,
  };
}

export function isGenerated(image: ImageConfig): boolean {
  return image.mode === "auto" || image.mode === "template";
}
