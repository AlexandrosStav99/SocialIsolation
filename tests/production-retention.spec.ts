import { expect, test } from "@playwright/test";

test("production withdrawal endpoint fails closed outside production runtime", async ({ request }) => {
  const response = await request.post("/api/handoff/manage/withdraw", {
    data: {
      requestId: "00000000-0000-4000-8000-000000000000",
      managementId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });

  expect(response.status()).toBe(503);
  const body = (await response.json()) as { code?: string };
  expect(body.code).toBe("production_withdrawal_unavailable");
});
