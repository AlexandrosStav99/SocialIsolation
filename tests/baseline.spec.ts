import { test, expect } from "@playwright/test";

test("landing opens the integrated deterministic check-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View check-in demo" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/check-in");
  await expect(page.getByRole("heading", { name: "Before we begin" })).toBeVisible();
  await page.getByRole("button",{name:"I confirm I am 18 or over"}).click();
  await expect(page.getByRole("heading",{name:"What would you like support with today?"})).toBeVisible();
});


test("integrated journey keeps optional text local and reaches deterministic results", async ({ page }) => {
  const sample="FICTIONAL_LOCAL_ONLY_SENTINEL"; const outbound:string[]=[];
  page.on("request",r=>outbound.push(r.url()+(r.postData()??"")));
  await page.goto("/check-in");
  await page.getByRole("button",{name:"I confirm I am 18 or over"}).click();
  await page.getByRole("button",{name:"Loneliness & Social Connection"}).click();
  await page.getByRole("button",{name:"Continue"}).click();
  const input=page.getByLabel("Optional context"); await input.fill(sample);
  await page.getByRole("button",{name:"Continue"}).click();
  await page.getByRole("button",{name:"Anywhere in Cyprus"}).click();
  await page.getByRole("button",{name:"Continue without additional preferences"}).click();
  await page.getByRole("button",{name:"Explore relevant services"}).click();
  await expect(page.getByText("Demonstration Community Support")).toBeVisible();
  await page.getByRole("button",{name:"Run controlled handoff demo"}).click();
  await expect(page.getByRole("status")).toContainText("Provider queue status: contact_attempted");
  await expect(page.getByRole("status")).toContainText("No real request was sent.");
  expect(outbound.join("
")).not.toContain(sample);
  expect(JSON.stringify(await page.evaluate(()=>[localStorage,sessionStorage]))).not.toContain(sample);
});


test("EL flow is available and under-18 gate ends the session", async ({ page }) => {
 await page.goto("/check-in"); await page.getByRole("button",{name:"EL",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Πριν ξεκινήσουμε"})).toBeVisible();
 await page.getByRole("button",{name:"Είμαι κάτω των 18"}).click();
 await expect(page.getByRole("heading",{name:"Η συνεδρία τερματίστηκε"})).toBeVisible();
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
