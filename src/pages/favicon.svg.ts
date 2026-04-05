import type { APIRoute } from "astro";
import { iconPath } from "virtual:theme-integration-config";
import { isSvg, svgResponse } from "../utils/icon";

export const GET: APIRoute = () => {
  if (!isSvg(iconPath!)) return new Response(null, { status: 404 });
  return svgResponse(iconPath!);
};
