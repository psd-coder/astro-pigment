import { template } from "virtual:pigment-og-template";
import { meta } from "virtual:pigment-config";
import { createOgImageRoute } from "../utils/ogImage";

export const GET = createOgImageRoute({ image: meta.og.image, template });
