import type { APIRoute } from "astro";
import { meta } from "virtual:pigment-config";
import { svgIconResponse } from "../utils/icon";

export const GET: APIRoute = () => svgIconResponse(meta.icon.faviconPath);
