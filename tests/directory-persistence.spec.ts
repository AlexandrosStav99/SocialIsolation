import { expect, test } from "@playwright/test";

test("demo directory is served from seeded Payload/PostgreSQL in the full CI runtime", async ({ request }) => {
  const response = await request.get("/api/directory");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    label?: string;
    source?: string;
    providers?: Array<{ id?: string; name?: string }>;
    services?: Array<{ id?: string; name?: string; integrated?: boolean }>;
  };

  expect(body.label).toBe("Demonstration Data");
  expect(body.source).toBe("payload_postgres");
  expect(body.providers?.length).toBeGreaterThanOrEqual(5);
  expect(body.services?.length).toBeGreaterThanOrEqual(5);
  expect(body.services?.some((service) => service.id === "demo-community-online" && service.integrated)).toBe(true);
  expect(body.services?.some((service) => service.id === "demo-practical-support")).toBe(true);
  expect(body.services?.some((service) => service.id === "demo-career-support")).toBe(true);
  expect(body.services?.some((service) => service.id === "demo-navigation-support")).toBe(true);
});
