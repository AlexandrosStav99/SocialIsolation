import { test, expect } from "@playwright/test";

test("landing opens the integrated deterministic check-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the check-in" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/check-in");
  await expect(page.getByRole("heading", { name: "A quick check before we start" })).toBeVisible();
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();
});

test("integrated journey keeps optional text local and reaches deterministic results", async ({ page }) => {
  const sample = "FICTIONAL_LOCAL_ONLY_SENTINEL";
  const outbound: string[] = [];
  page.on("request", (request) => outbound.push(request.url() + (request.postData() ?? "")));

  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  const input = page.getByLabel("In your own words (optional)");
  await input.fill(sample);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Anywhere in Cyprus" }).click();
  await expect(page.getByRole("heading", { name: "Does this look right?" })).toBeVisible();
  await expect(page.getByText("Support preferences", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Explore relevant services" }).click();
  await expect(page.getByText("Demonstration Community Support")).toBeVisible();
  await page.getByRole("button", { name: "Run controlled handoff demo" }).click();
  await expect(page.getByRole("heading", { name: "Sharing preview" })).toBeVisible();
  const confirm = page.getByRole("button", { name: "Confirm and run demo" });
  await expect(confirm).toBeDisabled();
  await page.getByRole("checkbox", { name: /explicitly consent/ }).check();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("status")).toContainText("Provider queue status: contact_attempted");
  await expect(page.getByRole("status")).toContainText("No real request was sent.");
  expect(outbound.join("\n")).not.toContain(sample);
  expect(JSON.stringify(await page.evaluate(() => [localStorage, sessionStorage]))).not.toContain(sample);
});

test("check-in supports back navigation and language switching without restarting", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await expect(page.getByRole("heading", { name: "Is there anything else connected to this?" })).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();

  await page.getByRole("button", { name: "EL", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Τι σε απασχολεί περισσότερο αυτή τη στιγμή;" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ένας γρήγορος έλεγχος πριν ξεκινήσουμε" })).toHaveCount(0);
});

test("ending a check-in clears optional free text before a new session", async ({ page }) => {
  const sample = "FICTIONAL_END_SESSION_SENTINEL";
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await page.getByLabel("In your own words (optional)").fill(sample);
  await page.getByRole("button", { name: "End check-in" }).click();
  await expect(page.getByRole("heading", { name: "Check-in ended" })).toBeVisible();

  await page.getByRole("button", { name: "Start again" }).click();
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await expect(page.getByLabel("In your own words (optional)")).toHaveValue("");
});

test("EL flow is available and under-18 gate ends the session", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "EL", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ένας γρήγορος έλεγχος πριν ξεκινήσουμε" })).toBeVisible();
  await page.getByRole("button", { name: "Όχι, είμαι κάτω των 18" }).click();
  await expect(page.getByRole("heading", { name: "Το check-in ολοκληρώθηκε" })).toBeVisible();
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

test("help-now action enters deterministic accessible safety state", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "I need help now" }).click();
  await expect(page.getByRole("status")).toContainText("Immediate support");
  await expect(page.getByText("Safety route: immediate_support")).toBeAttached();
});

test("demo handoff API rejects missing consent and client provider spoofing", async ({ request }) => {
  const base = {
    serviceId: "demo-community-online",
    primarySupportTopic: "social_connection",
    secondarySupportTopics: [],
    serviceArea: "anywhere_cyprus",
  };
  const withoutConsent = await request.post("/api/demo-handoff", { data: base });
  expect(withoutConsent.status()).toBe(400);
  const spoofed = await request.post("/api/demo-handoff", {
    data: { ...base, consentAccepted: true, providerOrganisationId: "attacker-controlled-org" },
  });
  expect(spoofed.status()).toBe(200);
  expect((await spoofed.json()).realRequestSent).toBe(false);
  const unknown = await request.post("/api/demo-handoff", {
    data: { ...base, serviceId: "unknown-service", consentAccepted: true },
  });
  expect(unknown.status()).toBe(400);
});
