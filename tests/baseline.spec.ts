import { test, expect } from "@playwright/test";

test("landing opens the integrated deterministic check-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the check-in" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/check-in");
  await expect(page.getByRole("heading", { name: "A quick check before we start" })).toBeVisible();
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();
});

test("integrated journey keeps optional text local and reaches explainable deterministic results", async ({ page }) => {
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
  await expect(page.getByText("Optional private context added")).toBeVisible();
  await expect(page.getByText(sample)).toHaveCount(0);

  await page.getByRole("button", { name: "Explore relevant services" }).click();
  await expect(page.getByText("Demonstration Community Service")).toBeVisible();
  await expect(page.getByText("Demonstration Community Support")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this may fit" })).toBeVisible();
  await expect(page.getByText("Supports your main topic: Loneliness & Social Connection")).toBeVisible();
  await expect(page.getByText("Eligibility / access")).toBeVisible();
  await expect(page.getByText(/language preference/i)).toHaveCount(0);

  await page.getByRole("button", { name: "Preview assisted handoff demo" }).click();
  await expect(page.getByRole("heading", { name: "Sharing preview" })).toBeVisible();
  await expect(page.getByText("What will be shared", { exact: true })).toBeVisible();
  await expect(page.getByText("What will not be shared", { exact: true })).toBeVisible();
  await expect(page.getByText(/anonymous session is not identified or linked to the fictional request/i)).toBeVisible();
  await expect(page.getByText("Your optional private free text", { exact: true })).toBeVisible();
  await expect(page.getByText(sample)).toHaveCount(0);

  const confirm = page.getByRole("button", { name: "Confirm and run demo" });
  await expect(confirm).toBeDisabled();
  await page.getByRole("checkbox", { name: /explicitly consent.*Demonstration Community Service/i }).check();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("status")).toContainText("Provider queue status: contact_attempted");
  await expect(page.getByRole("status")).toContainText("No real request was sent.");
  expect(outbound.join("\n")).not.toContain(sample);
  expect(JSON.stringify(await page.evaluate(() => [localStorage, sessionStorage]))).not.toContain(sample);
});

test("sharing preview can be cancelled without creating a request or losing results", async ({ page }) => {
  let handoffRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/demo-handoff") && request.method() === "POST") handoffRequests += 1;
  });

  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await page.getByRole("button", { name: "Skip this question" }).click();
  await page.getByRole("button", { name: "Anywhere in Cyprus" }).click();
  await page.getByRole("button", { name: "Explore relevant services" }).click();

  await page.getByRole("button", { name: "Preview assisted handoff demo" }).click();
  await expect(page.getByText("Demonstration Community Service", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Demonstration Community Support", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Fictional demo email: fictional-user@example.invalid", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel and keep exploring" }).click();

  await expect(page.getByRole("heading", { name: "Sharing preview" })).toHaveCount(0);
  await expect(page.getByText("Demonstration Community Support", { exact: true })).toBeVisible();
  expect(handoffRequests).toBe(0);
});

test("review exposes routing inputs and edits area without losing selections", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await page.getByRole("checkbox", { name: "Family & Relationships" }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip this question" }).click();
  await page.getByRole("button", { name: "Nicosia" }).click();

  await expect(page.getByRole("heading", { name: "Does this look right?" })).toBeVisible();
  await expect(page.getByText("Loneliness & Social Connection", { exact: true })).toBeVisible();
  await expect(page.getByText("Family & Relationships", { exact: true })).toBeVisible();
  await expect(page.getByText("Nicosia", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Edit area" }).click();
  await page.getByRole("button", { name: "Limassol" }).click();
  await expect(page.getByRole("heading", { name: "Does this look right?" })).toBeVisible();
  await expect(page.getByText("Loneliness & Social Connection", { exact: true })).toBeVisible();
  await expect(page.getByText("Family & Relationships", { exact: true })).toBeVisible();
  await expect(page.getByText("Limassol", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Edit main topic" }).click();
  await expect(page.getByRole("heading", { name: "What feels most important right now?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A quick check before we start" })).toHaveCount(0);
});

test("no-match recovery preserves choices and labels broader directory records honestly", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Financial & Basic Needs" }).click();
  await page.getByRole("button", { name: "Nothing else" }).click();
  await page.getByRole("button", { name: "Skip this question" }).click();
  await page.getByRole("button", { name: "Nicosia" }).click();
  await page.getByRole("button", { name: "Explore relevant services" }).click();

  await expect(page.getByRole("heading", { name: "No exact demonstration match found" })).toBeVisible();
  await expect(page.getByText(/does not mean suitable support does not exist/i)).toBeVisible();
  await page.getByRole("button", { name: "Browse all demonstration services" }).click();
  await expect(page.getByRole("heading", { name: "Broader demonstration directory" })).toBeVisible();
  await expect(page.getByText("Broader directory option · not an exact match")).toHaveCount(10);
  await expect(page.getByText(/recommended for you/i)).toHaveCount(0);
  await expect(page.getByText(/best match/i)).toHaveCount(0);

  await page.getByRole("button", { name: "Change area" }).click();
  await page.getByRole("button", { name: "Limassol" }).click();
  await expect(page.getByRole("heading", { name: "Does this look right?" })).toBeVisible();
  await expect(page.getByText("Financial & Basic Needs", { exact: true })).toBeVisible();
  await expect(page.getByText("Limassol", { exact: true })).toBeVisible();
});

test("Greek result and sharing preview content remain complete", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "EL", exact: true }).click();
  await page.getByRole("button", { name: "Ναι, είμαι 18 ετών ή άνω" }).click();
  await page.getByRole("button", { name: "Μοναξιά & Κοινωνική Σύνδεση" }).click();
  await page.getByRole("button", { name: "Τίποτα άλλο" }).click();
  await page.getByRole("button", { name: "Παράλειψη ερώτησης" }).click();
  await page.getByRole("button", { name: "Οπουδήποτε στην Κύπρο" }).click();
  await page.getByRole("button", { name: "Δες σχετικές υπηρεσίες" }).click();

  await expect(page.getByRole("heading", { name: "Γιατί μπορεί να είναι σχετική" })).toBeVisible();
  await expect(page.getByText("Διαθέσιμες γλώσσες")).toBeVisible();
  await expect(page.getByText("Προϋποθέσεις / πρόσβαση")).toBeVisible();

  await page.getByRole("button", { name: "Προεπισκόπηση επίδειξης υποβοηθούμενης παραπομπής" }).click();
  await expect(page.getByRole("heading", { name: "Προεπισκόπηση κοινοποίησης" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Τι θα κοινοποιηθεί" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Τι δεν θα κοινοποιηθεί" })).toBeVisible();
  await page.getByRole("button", { name: "Ακύρωση και συνέχιση εξερεύνησης" }).click();
  await expect(page.getByRole("heading", { name: "Προεπισκόπηση κοινοποίησης" })).toHaveCount(0);
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

test("help-now action is honest, accessible and does not destroy check-in progress", async ({ page }) => {
  await page.goto("/check-in");
  await page.getByRole("button", { name: "Yes, I’m 18 or over" }).click();
  await page.getByRole("button", { name: "Loneliness & Social Connection" }).click();
  await expect(page.getByRole("heading", { name: "Is there anything else connected to this?" })).toBeVisible();

  await page.getByRole("button", { name: "I need help now" }).click();
  await expect(page.getByRole("status")).toContainText("Immediate support");
  await expect(page.getByRole("status")).toContainText("does not publish real Cyprus immediate-support resources");
  await expect(page.getByText("Safety route: immediate_support")).toBeAttached();

  await page.getByRole("button", { name: "Continue with the check-in" }).click();
  await expect(page.getByText("Safety route: standard")).toBeAttached();
  await expect(page.getByRole("heading", { name: "Is there anything else connected to this?" })).toBeVisible();
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
