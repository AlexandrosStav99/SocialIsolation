import { expect, test } from "@playwright/test";

test("provider workspace fails closed without authenticated provider access", async ({ request }) => {
  const queue = await request.get("/api/provider/requests");
  expect(queue.status()).toBe(401);
  const queueBody = (await queue.json()) as { code?: string };
  expect(queueBody.code).toBe("authentication_required");

  const mutation = await request.patch("/api/provider/requests", {
    data: { action: "transition", requestId: "1", status: "contact_attempted" },
  });
  expect(mutation.status()).toBe(401);
});
