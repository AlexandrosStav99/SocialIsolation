import { expect, test } from "@playwright/test";

test("production handoff endpoint fails closed outside production runtime", async ({ request }) => {
  const response = await request.post("/api/handoff", {
    headers: { "Idempotency-Key": "00000000-0000-4000-8000-000000000000" },
    data: {
      serviceId: 1,
      contact: { type: "email", value: "nobody@example.invalid" },
      primarySupportTopic: "social_connection",
      secondarySupportTopics: [],
      serviceArea: "online",
      preferences: [],
      consentAccepted: true,
      consentVersion: "ci-v1",
      optionalNoteAccepted: false,
    },
  });

  expect(response.status()).toBe(503);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("production_handoff_unavailable");
});
