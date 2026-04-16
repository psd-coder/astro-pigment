import { fontProviders } from "astro/config";

type FontStyle = "normal" | "italic" | "oblique";
type Variant = {
  weight: string | number;
  style: FontStyle;
  src: [string, ...string[]];
};

export function fonts() {
  const basePath = new URL("../assets/fonts/", import.meta.url).pathname;

  const grotesk: [Variant] = [
    {
      weight: "100 900",
      style: "normal",
      src: [`${basePath}MartianGrotesk-VF.woff2`],
    },
  ];
  const mono: [Variant] = [
    {
      weight: 400,
      style: "normal",
      src: [`${basePath}MartianMono-Regular.woff2`],
    },
  ];

  return [
    {
      provider: fontProviders.local(),
      name: "Martian Grotesk",
      cssVariable: "--font-sans",
      options: { variants: grotesk },
    },
    {
      provider: fontProviders.local(),
      name: "Martian Mono",
      cssVariable: "--font-mono",
      options: { variants: mono },
    },
  ];
}
