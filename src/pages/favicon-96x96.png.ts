import type { APIRoute } from "astro";
import { meta } from "virtual:pigment-config";
import { pngIconResponse } from "../utils/icon";

export const GET: APIRoute = () => pngIconResponse(meta.icon.manifestIconPath, 96);
