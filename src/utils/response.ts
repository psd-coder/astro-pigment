export function notFoundResponse(message: string = "Not Found"): Response {
  return new Response(message, {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    status: 200,
    ...init,
  });
}

export function markdownResponse(data: string, init?: ResponseInit): Response {
  return new Response(data, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
    status: 200,
    ...init,
  });
}
