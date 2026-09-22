import { expect, test } from "@playwright/test";

test("Payload admin bootstrap UI renders", async ({ page }) => {
  const response = await page.goto("/admin/create-first-user");

  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("Payload REST does not expose managed collections anonymously", async ({ request }) => {
  const response = await request.get("/payload-api/providers");
  expect(response.ok()).toBeFalsy();
  expect(await response.text()).not.toContain("Demonstration Community");
});
