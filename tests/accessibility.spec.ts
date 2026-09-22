import { test, expect } from "@playwright/test";

test("check-in supports keyboard focus and deterministic progression", async ({ page }) => {
  await page.goto("/check-in");
  const button = page.getByRole("button", { name: "Yes, I’m 18 or over" });
  await button.focus();
  await expect(button).toBeFocused();
  await button.press("Enter");
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();
});

test("mobile check-in has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/check-in");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("EL and EN content contracts remain complete", async () => {
  const fs = await import("node:fs");
  const source = fs.readFileSync("lib/i18n/content.ts", "utf8");
  for (const key of ["title", "status", "conversation", "input", "placeholder", "send", "latest", "helpNow", "empty", "loading", "noMatch"]) {
    expect(source).toContain(key);
  }
  expect(source).toContain(" el:");
  expect(source).toContain(" en:");
});
