import { readFileSync } from "node:fs";
import sharp from "sharp";

export function isSvg(iconPath: string): boolean {
  return iconPath.endsWith(".svg");
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function svgResponse(iconPath: string): Response {
  return new Response(toArrayBuffer(readFileSync(iconPath)), {
    headers: { "Content-Type": "image/svg+xml" },
  });
}

export async function pngResponse(iconPath: string, size: number): Promise<Response> {
  const buf = await sharp(iconPath).resize(size, size).png().toBuffer();
  return new Response(toArrayBuffer(buf), {
    headers: { "Content-Type": "image/png" },
  });
}

// ICO: ICONDIR header + ICONDIRENTRY per image + PNG payloads
export async function icoResponse(iconPath: string): Promise<Response> {
  const png32 = await sharp(iconPath).resize(32, 32).png().toBuffer();
  const png16 = await sharp(iconPath).resize(16, 16).png().toBuffer();

  const images = [png16, png32];
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * count;
  const totalSize = dirSize + images.reduce((sum, img) => sum + img.length, 0);
  const ico = Buffer.alloc(totalSize);

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(count, 4);

  let dataOffset = dirSize;
  const sizes = [16, 32];

  for (let i = 0; i < count; i++) {
    const img = images[i]!;
    const size = sizes[i]!;
    const entryOffset = headerSize + i * entrySize;

    ico.writeUInt8(size === 256 ? 0 : size, entryOffset);
    ico.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(img.length, entryOffset + 8);
    ico.writeUInt32LE(dataOffset, entryOffset + 12);

    img.copy(ico, dataOffset);
    dataOffset += img.length;
  }

  return new Response(toArrayBuffer(ico), {
    headers: { "Content-Type": "image/x-icon" },
  });
}
