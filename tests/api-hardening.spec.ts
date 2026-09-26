import { expect, test } from "@playwright/test";

test("application responses include baseline security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
});

test("demo handoff enforces JSON content type", async ({ request }) => {
  const response = await request.post("/api/demo-handoff", {
    headers: { "Content-Type": "text/plain" },
    data: "{}",
  });
  expect(response.status()).toBe(415);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("unsupported_media_type");
});

test("demo handoff rejects oversized JSON before business logic", async ({ request }) => {
  const response = await request.post("/api/demo-handoff", {
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ junk: "x".repeat(5 * 1024) }),
  });
  expect(response.status()).toBe(413);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("request_too_large");
});

test("demo handoff blocks cross-origin browser requests", async ({ request }) => {
  const response = await request.post("/api/demo-handoff", {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://cross-origin.invalid",
    },
    data: JSON.stringify({
      serviceId: "demo-community-online",
      consentAccepted: true,
      primarySupportTopic: "social_connection",
      serviceArea: "online",
    }),
  });
  expect(response.status()).toBe(403);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("origin_not_allowed");
});
