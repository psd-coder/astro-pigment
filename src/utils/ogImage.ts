import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { meta, publicSiteUrl, theme } from "virtual:pigment-config";
import type { OgTemplateContext, OgTemplateFn, OgTemplateFont } from "../types";
import { notFoundResponse } from "./response";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

type ResolvedImage = typeof meta.og.image;

let cachedFonts: OgTemplateFont[] | null = null;

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function loadOgFonts(): OgTemplateFont[] {
  if (!cachedFonts) {
    const { sansRegular, sansBold, mono } = meta.og.fontPaths;
    const readFont = (p: string) => toArrayBuffer(readFileSync(p));
    cachedFonts = [
      { name: "Martian Grotesk", data: readFont(sansRegular), weight: 400, style: "normal" },
      { name: "Martian Grotesk", data: readFont(sansBold), weight: 700, style: "normal" },
      { name: "Martian Mono", data: readFont(mono), weight: 400, style: "normal" },
    ];
  }
  return cachedFonts;
}

async function loadLogo(filePath: string): Promise<{ src: string; width: number; height: number }> {
  const buf = readFileSync(filePath);
  const imageMeta = await sharp(buf).metadata();
  const mime = path.extname(filePath).toLowerCase() === ".svg" ? "image/svg+xml" : "image/png";
  return {
    src: `data:${mime};base64,${buf.toString("base64")}`,
    width: imageMeta.width ?? 0,
    height: imageMeta.height ?? 0,
  };
}

function formatSiteUrl(siteUrl: string): string {
  if (!siteUrl) return "";
  const u = new URL(siteUrl);
  return `${u.host}${u.pathname.replace(/\/$/, "")}`;
}

export function builtInOgTemplate(ctx: OgTemplateContext): unknown {
  const display = formatSiteUrl(ctx.siteUrl);
  const logoMaxHeight = 120;
  const logoNode =
    ctx.logo && ctx.logo.height
      ? {
          type: "img",
          props: {
            src: ctx.logo.src,
            width: Math.round((ctx.logo.width / ctx.logo.height) * logoMaxHeight),
            height: logoMaxHeight,
          },
        }
      : null;

  const stack: unknown[] = [];
  if (logoNode) {
    stack.push(logoNode);
  } else {
    stack.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          fontSize: "96px",
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        },
        children: ctx.projectName,
      },
    });
  }
  stack.push({
    type: "div",
    props: {
      style: {
        display: "-webkit-box",
        marginTop: "16px",
        fontSize: "36px",
        lineHeight: 1.3,
        color: "rgba(255,255,255,0.7)",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      },
      children: ctx.description,
    },
  });

  return {
    type: "div",
    props: {
      style: {
        width: `${OG_WIDTH}px`,
        height: `${OG_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        backgroundColor: `hsl(${ctx.hue} 45% 22%)`,
        fontFamily: "Martian Grotesk",
        color: "white",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "32px" },
            children: stack,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "Martian Mono",
              fontSize: "32px",
            },
            children: display,
          },
        },
      ],
    },
  };
}

export async function renderOgPng(tree: unknown, fonts: OgTemplateFont[]): Promise<Buffer> {
  const svg = await satori(tree as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: fonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight as 400 | 700 | undefined,
      style: f.style,
    })),
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function renderGenerated(
  image: Extract<ResolvedImage, { mode: "auto" | "template" }>,
  template: OgTemplateFn | null,
  pathname: string,
): Promise<Buffer> {
  const fonts = loadOgFonts();
  const logo = image.logoPath ? await loadLogo(image.logoPath) : undefined;
  const ctx: OgTemplateContext = {
    projectName: image.title,
    description: image.description,
    siteUrl: publicSiteUrl,
    pathname,
    logo,
    hue: theme.hue,
    fonts,
  };
  const tree = image.mode === "auto" ? builtInOgTemplate(ctx) : await template?.(ctx);
  if (!tree) throw new Error("[astro-pigment] og template returned no node");
  return renderOgPng(tree, fonts);
}

export function createOgImageRoute(deps: {
  image: ResolvedImage;
  template: OgTemplateFn | null;
}): APIRoute {
  return async ({ url }) => {
    const { image } = deps;
    if (image.mode === "none") return notFoundResponse();
    const png =
      image.mode === "file"
        ? readFileSync(image.filePath)
        : await renderGenerated(image, deps.template, url.pathname);
    return new Response(toArrayBuffer(png), {
      headers: { "Content-Type": "image/png" },
    });
  };
}
