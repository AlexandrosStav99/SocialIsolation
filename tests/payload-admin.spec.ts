import { expect, request as playwrightRequest, test } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";
const adminEmail = "prod2-super-admin@test.invalid";
const adminPassword = "Prod2-Admin-Password-2026!";
const platformEmail = "prod2-platform-admin@test.invalid";
const platformPassword = "Prod2-Platform-Password-2026!";
const lockedEmail = "prod2-lockout@test.invalid";
const lockedPassword = "Prod2-Lockout-Password-2026!";
const providerEmail = "prod3-provider-manager@test.invalid";
const providerPassword = "Prod3-Provider-Password-2026!";

type CreateResponse = {
  doc?: { id?: string | number };
  id?: string | number;
};

function createdId(body: CreateResponse): string | number {
  const id = body.doc?.id ?? body.id;
  if (id === undefined) throw new Error("Payload create response did not include an id");
  return id;
}

test("Payload admin bootstrap UI renders", async ({ page }) => {
  const response = await page.goto("/admin/create-first-user");

  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("Payload authentication enforces activation, least privilege, sessions and lockout", async () => {
  const admin = await playwrightRequest.newContext({ baseURL });
  const inactive = await playwrightRequest.newContext({ baseURL });
  const platform = await playwrightRequest.newContext({ baseURL });
  const locked = await playwrightRequest.newContext({ baseURL });
  const provider = await playwrightRequest.newContext({ baseURL });

  try {
    const shortPassword = await admin.post("/payload-api/provider-users", {
      data: {
        email: "prod2-short-password@test.invalid",
        password: "too-short",
        role: "super_admin",
      },
    });
    expect(shortPassword.ok()).toBeFalsy();

    const bootstrap = await admin.post("/payload-api/provider-users", {
      data: {
        email: adminEmail,
        password: adminPassword,
        role: "super_admin",
      },
    });
    expect(bootstrap.ok()).toBeTruthy();
    const adminId = createdId((await bootstrap.json()) as CreateResponse);

    const login = await admin.post("/payload-api/provider-users/login", {
      data: { email: adminEmail, password: adminPassword },
    });
    expect(login.ok()).toBeTruthy();
    expect(login.headers()["set-cookie"]).toContain("HttpOnly");
    expect(login.headers()["set-cookie"]).toContain("SameSite=Lax");
    const loginBody = (await login.json()) as { token?: string; user?: { active?: boolean } };
    expect(loginBody.token).toBeUndefined();
    expect(loginBody.user?.active).toBe(true);

    const finalAdminGuard = await admin.patch(`/payload-api/provider-users/${adminId}`, {
      data: { active: false },
    });
    expect(finalAdminGuard.ok()).toBeFalsy();

    const inactiveCreate = await admin.post("/payload-api/provider-users", {
      data: {
        email: platformEmail,
        password: platformPassword,
        role: "platform_admin",
      },
    });
    expect(inactiveCreate.ok()).toBeTruthy();
    const platformId = createdId((await inactiveCreate.json()) as CreateResponse);

    const inactiveLogin = await inactive.post("/payload-api/provider-users/login", {
      data: { email: platformEmail, password: platformPassword },
    });
    expect(inactiveLogin.ok()).toBeFalsy();

    const activate = await admin.patch(`/payload-api/provider-users/${platformId}`, {
      data: { active: true },
    });
    expect(activate.ok()).toBeTruthy();

    let platformLogin = await platform.post("/payload-api/provider-users/login", {
      data: { email: platformEmail, password: platformPassword },
    });
    expect(platformLogin.ok()).toBeTruthy();

    const deactivatePlatformUser = await admin.patch(`/payload-api/provider-users/${platformId}`, {
      data: { active: false },
    });
    expect(deactivatePlatformUser.ok()).toBeTruthy();

    const afterDeactivation = await platform.get("/payload-api/provider-users/me");
    const afterDeactivationBody = (await afterDeactivation.json()) as { user?: unknown };
    expect(afterDeactivationBody.user ?? null).toBeNull();

    const loginWhileInactive = await platform.post("/payload-api/provider-users/login", {
      data: { email: platformEmail, password: platformPassword },
    });
    expect(loginWhileInactive.ok()).toBeFalsy();

    const reactivatePlatformUser = await admin.patch(`/payload-api/provider-users/${platformId}`, {
      data: { active: true },
    });
    expect(reactivatePlatformUser.ok()).toBeTruthy();

    platformLogin = await platform.post("/payload-api/provider-users/login", {
      data: { email: platformEmail, password: platformPassword },
    });
    expect(platformLogin.ok()).toBeTruthy();

    const privilegeEscalation = await platform.patch(`/payload-api/provider-users/${platformId}`, {
      data: { role: "super_admin", organisation: null },
    });
    expect(privilegeEscalation.ok()).toBeFalsy();

    const userCreation = await platform.post("/payload-api/provider-users", {
      data: {
        email: "prod2-unauthorised-create@test.invalid",
        password: "Prod2-Unauthorised-Password-2026!",
        role: "platform_admin",
      },
    });
    expect(userCreation.ok()).toBeFalsy();

    const lockoutUser = await admin.post("/payload-api/provider-users", {
      data: {
        email: lockedEmail,
        password: lockedPassword,
        role: "platform_admin",
        active: true,
      },
    });
    expect(lockoutUser.ok()).toBeTruthy();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const failedLogin = await locked.post("/payload-api/provider-users/login", {
        data: { email: lockedEmail, password: "definitely-wrong-password" },
      });
      expect(failedLogin.ok()).toBeFalsy();
    }

    const lockedCorrectLogin = await locked.post("/payload-api/provider-users/login", {
      data: { email: lockedEmail, password: lockedPassword },
    });
    expect(lockedCorrectLogin.ok()).toBeFalsy();

    const unlock = await admin.post("/payload-api/provider-users/unlock", {
      data: { email: lockedEmail },
    });
    expect(unlock.ok()).toBeTruthy();

    const unlockedLogin = await locked.post("/payload-api/provider-users/login", {
      data: { email: lockedEmail, password: lockedPassword },
    });
    expect(unlockedLogin.ok()).toBeTruthy();

    const providerOrganisation = await admin.post("/payload-api/provider-organisations", {
      data: { name: "PROD-3 Provider Session Test Organisation" },
    });
    expect(providerOrganisation.ok()).toBeTruthy();
    const providerOrganisationId = createdId(
      (await providerOrganisation.json()) as CreateResponse,
    );

    const providerUser = await admin.post("/payload-api/provider-users", {
      data: {
        email: providerEmail,
        password: providerPassword,
        role: "provider_manager",
        organisation: providerOrganisationId,
        active: true,
      },
    });
    expect(providerUser.ok()).toBeTruthy();
    const providerUserId = createdId((await providerUser.json()) as CreateResponse);

    const providerLogin = await provider.post("/payload-api/provider-users/login", {
      data: { email: providerEmail, password: providerPassword },
    });
    expect(providerLogin.ok()).toBeTruthy();

    const providerQueue = await provider.get("/api/provider/requests");
    expect(providerQueue.status()).toBe(200);
    const providerQueueBody = (await providerQueue.json()) as { totalDocs?: number };
    expect(providerQueueBody.totalDocs).toBe(0);

    const platformWorkspace = await platform.get("/api/provider/requests");
    expect(platformWorkspace.status()).toBe(403);
    const platformWorkspaceBody = (await platformWorkspace.json()) as { code?: string };
    expect(platformWorkspaceBody.code).toBe("provider_role_required");

    const deactivateProvider = await admin.patch(`/payload-api/provider-users/${providerUserId}`, {
      data: { active: false },
    });
    expect(deactivateProvider.ok()).toBeTruthy();

    const providerAfterDeactivation = await provider.get("/api/provider/requests");
    expect(providerAfterDeactivation.status()).toBe(401);

    const logout = await platform.post("/payload-api/provider-users/logout?allSessions=true");
    expect(logout.ok()).toBeTruthy();

    const meAfterLogout = await platform.get("/payload-api/provider-users/me");
    const meBody = (await meAfterLogout.json()) as { user?: unknown };
    expect(meBody.user ?? null).toBeNull();
  } finally {
    await Promise.all([
      admin.dispose(),
      inactive.dispose(),
      platform.dispose(),
      locked.dispose(),
      provider.dispose(),
    ]);
  }
});

test("Payload REST does not expose managed collections anonymously", async ({ request }) => {
  const response = await request.get("/payload-api/providers");
  expect(response.ok()).toBeFalsy();
  expect(await response.text()).not.toContain("Demonstration Community");
});
