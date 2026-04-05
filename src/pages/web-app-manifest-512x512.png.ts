import type { APIRoute } from "astro";
import { iconPath } from "virtual:theme-integration-config";
import { pngResponse } from "../utils/icon";

export const GET: APIRoute = () => pngResponse(iconPath!, 512);
