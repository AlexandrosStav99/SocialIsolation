import { expect, test } from "@playwright/test";

test("liveness endpoint is minimal and non-cacheable", async ({ request }) => {
  const response = await request.get("/api/health/live");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("readiness endpoint verifies runtime dependencies without exposing details", async ({ request }) => {
  const response = await request.get("/api/health/ready");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ready" });
  expect(response.headers()["cache-control"]).toContain("no-store");
});
