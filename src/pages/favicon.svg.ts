import type { APIRoute } from "astro";
import { iconPath } from "virtual:theme-integration-config";
import { svgIconResponse } from "../utils/icon";

export const GET: APIRoute = () => svgIconResponse(iconPath);
