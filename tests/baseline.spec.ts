import { test, expect } from "@playwright/test";

test("landing navigates without transporting free text", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("textarea")).toHaveCount(0);
  await page.getByRole("button", { name: "Start the check-in" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/check-in");
  await expect(page.getByRole("heading", { name: "Check-in Demonstration" })).toBeVisible();
});

test("old query text is not hydrated; demo text stays out of network and storage", async ({ page }) => {
  const legacy = "LEGACY_SENSITIVE_SENTINEL";
  const sample = "FICTIONAL_LOCAL_ONLY_SENTINEL";
  await page.goto(`/check-in?message=${legacy}&text=${legacy}`);
  await expect(page.getByRole("log")).not.toContainText(legacy);
  const input = page.getByRole("textbox", { name: "Fictional demo message" });
  await expect(input).toHaveValue("");
  const outbound: string[] = [];
  page.on("request", (request) => outbound.push(request.url() + (request.postData() ?? "")));
  await expect(input).toHaveAttribute("maxlength", "500");
  await input.fill(sample);
  await page.getByRole("button", { name: "Send demo message" }).click();
  await expect(page.getByRole("log")).toContainText(sample);
  await expect(page.getByRole("log")).toContainText("Demo: the future check-in");
  expect(page.url()).not.toContain(sample);
  expect(outbound.join("\n")).not.toContain(sample);
  const stored = await page.evaluate(() => JSON.stringify([localStorage, sessionStorage]));
  expect(stored).not.toContain(sample);
  await page.reload();
  await expect(page.getByRole("log")).not.toContainText(sample);
});

test("demo escapes text and ends without fabricating referrals", async ({ page }) => {
  await page.goto("/check-in");
  const input = page.getByRole("textbox");
  await input.fill('<img src=x onerror="alert(1)">');
  await input.press("Enter");
  await expect(page.getByRole("log").locator("img")).toHaveCount(0);
  for (let i = 0; i < 3; i++) {
    await input.fill(`Fictional example ${i}`);
    await input.press("Enter");
  }
  await expect(input).toBeDisabled();
  await expect(page.getByRole("log")).toContainText("no contact request has been created or sent");
  await expect(page.getByRole("log").locator("a")).toHaveCount(0);
});

test("dashboard is unavailable by default including attempted query opt-in", async ({ request }) => {
  for (const path of ["/dashboard", "/dashboard?TALKPOINT_ENABLE_DEMO_DASHBOARD=true"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain("TP-1089");
  }
});

test("explicit demo opt-in works without a Mapbox token or runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:3101/dashboard");
  await expect(page.getByText("Demonstration Data", { exact: true })).toBeVisible();
  await expect(page.getByText("Map preview unavailable.", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Demonstration district totals")).toContainText("Suppressed");
  await page.getByRole("button", { name: "new", exact: true }).click();
  await expect(page.getByText("Showing 2 of 7 requests", { exact: false })).toBeVisible();
  await expect(page.getByText("Severity:", { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("about route resolves with its linked lowercase path", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("link", { name: "Privacy", exact: true }).first()).toHaveAttribute("href", "/#privacy");
});
