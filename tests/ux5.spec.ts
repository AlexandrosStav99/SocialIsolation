import { test, expect, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function reachCommunityResults(page: Page) {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await page.getByRole("button", { name: "Skip this question" }).click();
  await page.getByRole("button", { name: "Anywhere in Cyprus" }).click();
  await page.getByRole("button", { name: "Explore relevant services" }).click();
  await expect(page.getByText("Demonstration Community Support", { exact: true })).toBeVisible();
}

test("mobile navigation exposes state, closes with Escape and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAttribute("aria-controls", "mobile-primary-navigation");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expectNoHorizontalOverflow(page);
});

test("check-in language switch updates the document language without restarting", async ({ page }) => {
  await page.goto("/check-in");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "EL", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "el");
  await expect(page.getByRole("heading", { name: "Τι σε απασχολεί περισσότερο αυτή τη στιγμή;" })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();
});

test("375px check-in through sharing preview has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await reachCommunityResults(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Preview assisted handoff demo" }).click();
  await expect(page.getByRole("heading", { name: "Sharing preview" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("handoff failure is recoverable and keeps the sharing preview available for retry", async ({ page }) => {
  await reachCommunityResults(page);
  await page.getByRole("button", { name: "Preview assisted handoff demo" }).click();
  await page.getByRole("checkbox", { name: /explicitly consent/i }).check();

  await page.route("**/api/demo-handoff", async (route) => {
    await route.abort("failed");
  });

  const confirm = page.getByRole("button", { name: "Confirm and run demo" });
  await confirm.click();
  await expect(page.getByRole("status")).toContainText("could not be confirmed");
  await expect(page.getByRole("heading", { name: "Sharing preview" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /explicitly consent/i })).toBeChecked();
  await expect(confirm).toBeEnabled();
});

test("handoff submission prevents duplicate confirmation while request is in flight", async ({ page }) => {
  await reachCommunityResults(page);
  await page.getByRole("button", { name: "Preview assisted handoff demo" }).click();
  await page.getByRole("checkbox", { name: /explicitly consent/i }).check();

  let requests = 0;
  await page.route("**/api/demo-handoff", async (route) => {
    requests += 1;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requestCreated: true, queueVisible: true, status: "contact_attempted", realRequestSent: false }),
    });
  });

  const confirm = page.getByRole("button", { name: "Confirm and run demo" });
  await confirm.click();
  const running = page.getByRole("button", { name: "Running demo…" });
  await expect(running).toBeDisabled();
  await running.click({ force: true });
  await expect(page.getByRole("status")).toContainText("Demo handoff completed");
  expect(requests).toBe(1);
  await expect(page.getByRole("heading", { name: "Sharing preview" })).toHaveCount(0);
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scrollBehavior = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior);
  expect(scrollBehavior).toBe("auto");
});
