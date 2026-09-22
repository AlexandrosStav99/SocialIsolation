import { expect, test } from "@playwright/test";

test("expanded fictional integrated service completes the controlled handoff", async ({ request }) => {
  const response = await request.post("/api/demo-handoff", {
    data: {
      serviceId: "demo-family-guidance",
      consentAccepted: true,
      primarySupportTopic: "family_relationships",
      secondarySupportTopics: [],
      serviceArea: "limassol",
    },
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    label: "Demonstration Data",
    requestCreated: true,
    queueVisible: true,
    status: "contact_attempted",
    realRequestSent: false,
  });
});
