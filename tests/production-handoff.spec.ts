import { expect, test } from "@playwright/test";

const handoffData = {
  serviceId: 1,
  contact: { type: "email", value: "nobody@example.invalid" },
  primarySupportTopic: "social_connection",
  secondarySupportTopics: [],
  serviceArea: "online",
  preferences: [],
  consentVersion: "ci-v1",
  optionalNoteAccepted: false,
};

test("production handoff and Sharing Preview fail closed outside production runtime", async ({ request }) => {
  const preview = await request.post("/api/handoff/preview", { data: handoffData });
  expect(preview.status()).toBe(503);
  const previewBody = (await preview.json()) as { code?: string };
  expect(previewBody.code).toBe("production_handoff_unavailable");

  const response = await request.post("/api/handoff", {
    headers: { "Idempotency-Key": "00000000-0000-4000-8000-000000000000" },
    data: {
      ...handoffData,
      consentAccepted: true,
      previewToken: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });

  expect(response.status()).toBe(503);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("production_handoff_unavailable");
});
