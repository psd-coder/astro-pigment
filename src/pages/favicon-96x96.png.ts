import type { APIRoute } from "astro";
import { iconPath } from "virtual:theme-integration-config";
import { pngIconResponse } from "../utils/icon";

export const GET: APIRoute = () => pngIconResponse(iconPath, 96);
