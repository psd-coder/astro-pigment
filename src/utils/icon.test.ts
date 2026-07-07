import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { icoIconResponse, isSvg, pngIconResponse, pngToIco, svgIconResponse } from "./icon";

describe("isSvg", () => {
  it("is true for .svg paths", () => {
    expect(isSvg("/a/b/icon.svg")).toBe(true);
  });

  it("is false for other extensions", () => {
    expect(isSvg("/a/b/icon.png")).toBe(false);
  });
});

describe("pngToIco", () => {
  const png = Buffer.from([1, 2, 3, 4]);

  it("prepends a 22-byte ICO header before the png payload", () => {
    const ico = pngToIco(png, 32);
    expect(ico.length).toBe(22 + png.length);
    expect(ico.readUInt16LE(0)).toBe(0); // reserved
    expect(ico.readUInt16LE(2)).toBe(1); // type: icon
    expect(ico.readUInt16LE(4)).toBe(1); // image count
    expect(ico.readUInt8(6)).toBe(32); // width
    expect(ico.readUInt8(7)).toBe(32); // height
    expect(ico.readUInt16LE(10)).toBe(1); // color planes
    expect(ico.readUInt16LE(12)).toBe(32); // bits per pixel
    expect(ico.readUInt32LE(14)).toBe(png.length); // payload size
    expect(ico.readUInt32LE(18)).toBe(22); // payload offset
    expect(ico.subarray(22)).toEqual(png);
  });

  it("encodes a 256px icon as 0 in the width/height bytes", () => {
    const ico = pngToIco(png, 256);
    expect(ico.readUInt8(6)).toBe(0);
    expect(ico.readUInt8(7)).toBe(0);
  });
});

describe("responses without an icon path", () => {
  it("returns 404 for a null svg path", () => {
    expect(svgIconResponse(null).status).toBe(404);
  });

  it("returns 404 for a null png path", async () => {
    expect((await pngIconResponse(null, 32)).status).toBe(404);
  });
});

describe("responses backed by an icon file", () => {
  const svgPath = join(tmpdir(), `pigment-icon-${process.pid}.svg`);
  const pngPath = join(tmpdir(), `pigment-icon-${process.pid}.png`);

  beforeAll(async () => {
    writeFileSync(svgPath, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const png = await sharp({
      create: { width: 48, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .png()
      .toBuffer();
    writeFileSync(pngPath, png);
  });

  afterAll(() => {
    unlinkSync(svgPath);
    unlinkSync(pngPath);
  });

  it("serves an svg file with the svg content type", async () => {
    const res = svgIconResponse(svgPath);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(await res.text()).toBe(readFileSync(svgPath, "utf-8"));
  });

  it("resizes and serves a png", async () => {
    const res = await pngIconResponse(pngPath, 16);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
    expect(meta.width).toBe(16);
    expect(meta.height).toBe(16);
  });

  it("serves an ico built from the png", async () => {
    const res = await icoIconResponse(pngPath);
    expect(res.headers.get("Content-Type")).toBe("image/x-icon");
    expect(Buffer.from(await res.arrayBuffer()).readUInt16LE(2)).toBe(1); // ICO type marker
  });
});
