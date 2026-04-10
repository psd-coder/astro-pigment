import { readFileSync } from "node:fs";
import sharp from "sharp";
import { notFoundResponse } from "./response";

export function isSvg(iconPath: string): boolean {
  return iconPath.endsWith(".svg");
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function svgIconResponse(iconPath: string | null): Response {
  if (!iconPath) {
    return notFoundResponse();
  }

  return new Response(toArrayBuffer(readFileSync(iconPath)), {
    headers: { "Content-Type": "image/svg+xml" },
  });
}

export async function pngIconResponse(iconPath: string | null, size: number): Promise<Response> {
  if (!iconPath) {
    return notFoundResponse();
  }

  const buffer = await sharp(iconPath).resize(size, size).png().toBuffer();

  return new Response(toArrayBuffer(buffer), {
    headers: { "Content-Type": "image/png" },
  });
}

// ICO: ICONDIR header (6 bytes) + single ICONDIRENTRY (16 bytes) + PNG payload
function pngToIco(png: Buffer, size: number): Buffer {
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize;
  const ico = Buffer.alloc(dataOffset + png.length);

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(1, 4);

  ico.writeUInt8(size === 256 ? 0 : size, headerSize);
  ico.writeUInt8(size === 256 ? 0 : size, headerSize + 1);
  ico.writeUInt8(0, headerSize + 2);
  ico.writeUInt8(0, headerSize + 3);
  ico.writeUInt16LE(1, headerSize + 4);
  ico.writeUInt16LE(32, headerSize + 6);
  ico.writeUInt32LE(png.length, headerSize + 8);
  ico.writeUInt32LE(dataOffset, headerSize + 12);

  png.copy(ico, dataOffset);

  return ico;
}

export async function icoIconResponse(iconPath: string): Promise<Response> {
  const png = await sharp(iconPath).resize(32, 32).png().toBuffer();
  const ico = pngToIco(png, 32);

  return new Response(toArrayBuffer(ico), {
    headers: { "Content-Type": "image/x-icon" },
  });
}
