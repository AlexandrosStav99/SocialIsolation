import { expect, test } from "@playwright/test";

test("directory outage never falls back to client-side fictional providers", async ({ page }) => {
  await page.route("**/api/directory", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "directory_unavailable", providers: [], services: [] }),
    });
  });

  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await page.getByRole("button", { name: "Skip this question" }).click();
  await page.getByRole("button", { name: "Anywhere in Cyprus" }).click();
  await page.getByRole("button", { name: "Explore relevant services" }).click();

  await expect(
    page.getByRole("heading", { name: "Service directory temporarily unavailable" }),
  ).toBeVisible();
  await expect(page.getByText("Demonstration Community Support")).toHaveCount(0);
  await expect(page.getByText("Demonstration Student Navigation")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Browse all demonstration services" })).toHaveCount(0);
});
