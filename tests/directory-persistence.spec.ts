import { expect, test } from "@playwright/test";

test("demo directory uses Payload/PostgreSQL in CI with a local synthetic fallback", async ({ request }) => {
  const response = await request.get("/api/directory");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    label?: string;
    source?: string;
    providers?: Array<{ id?: string; name?: string }>;
    services?: Array<{ id?: string; name?: string; integrated?: boolean }>;
  };

  expect(body.label).toBe("Demonstration Data");
  expect(["payload_postgres", "synthetic_fallback"]).toContain(body.source);
  if (process.env.CI) expect(body.source).toBe("payload_postgres");

  expect(body.providers).toHaveLength(2);
  expect(body.services).toHaveLength(2);
  expect(
    body.services?.some(
      (service) => service.id === "demo-community-online" && service.integrated === true,
    ),
  ).toBe(true);
  expect(
    body.services?.some(
      (service) => service.id === "demo-student-online" && service.integrated === false,
    ),
  ).toBe(true);
});
