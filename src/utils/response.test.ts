import { describe, expect, it } from "vitest";
import { jsonResponse, markdownResponse, notFoundResponse } from "./response";

describe("notFoundResponse", () => {
  it("defaults to a 404 text/plain body", async () => {
    const res = notFoundResponse();
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("Not Found");
  });

  it("uses a custom message", async () => {
    const res = notFoundResponse("Missing");
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Missing");
  });
});

describe("jsonResponse", () => {
  it("serializes data as JSON with a 200 status", async () => {
    const res = jsonResponse({ a: 1, b: ["x"] });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(await res.json()).toEqual({ a: 1, b: ["x"] });
  });

  it("lets init override the status", () => {
    expect(jsonResponse({}, { status: 201 }).status).toBe(201);
  });
});

describe("markdownResponse", () => {
  it("returns the body as text/markdown with a 200 status", async () => {
    const res = markdownResponse("# Title");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(await res.text()).toBe("# Title");
  });

  it("lets init override the status", () => {
    expect(markdownResponse("gone", { status: 404 }).status).toBe(404);
  });
});
