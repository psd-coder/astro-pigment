import { template } from "virtual:pigment-twitter-template";
import { meta } from "virtual:pigment-config";
import { createOgImageRoute } from "../utils/ogImage";

export const GET = createOgImageRoute({ image: meta.twitter.image, template });
