import type { APIRoute } from "astro";
import { iconPath } from "virtual:theme-integration-config";
import { icoResponse } from "../utils/icon";

export const GET: APIRoute = () => icoResponse(iconPath!);
