import fs from "node:fs";

const required = [
  "payload.config.ts",
  "payload/access.ts",
  "payload/collections/ProviderOrganisations.ts",
  "payload/collections/ProviderUsers.ts",
  "payload/collections/Providers.ts",
  "payload/collections/Services.ts",
  "lib/directory/payload-repository.ts",
  "app/(frontend)/layout.tsx",
  "app/(frontend)/page.tsx",
  "app/(payload)/layout.tsx",
  "app/(payload)/admin/[[...segments]]/page.tsx",
  "app/(payload)/admin/[[...segments]]/not-found.tsx",
  "app/(payload)/admin/importMap.js",
  "app/(payload)/payload-api/[...slug]/route.ts",
];

for (const path of required) {
  if (!fs.existsSync(path)) throw new Error(`Missing Payload runtime file: ${path}`);
}

if (fs.existsSync("app/layout.tsx")) {
  throw new Error("Frontend and Payload must use separate route-group root layouts");
}

const config = fs.readFileSync("payload.config.ts", "utf8");
if (!config.includes("postgresAdapter") || !config.includes("getDatabaseUrl")) {
  throw new Error("Payload must use server-side PostgreSQL configuration");
}
if (!config.includes('user: "provider-users"')) {
  throw new Error("Payload Admin must authenticate through provider-users");
}
if (!config.includes('api: "/payload-api"')) {
  throw new Error("Payload REST API must remain separate from TalkPoint custom /api routes");
}

const access = fs.readFileSync("payload/access.ts", "utf8");
for (const marker of [
  "platformManagedCollection",
  "providerUserAdminCollection",
  "hiddenSystemCollection",
  "super_admin",
  "platform_admin",
]) {
  if (!access.includes(marker)) throw new Error(`Missing Payload admin access boundary: ${marker}`);
}

const providerUsers = fs.readFileSync("payload/collections/ProviderUsers.ts", "utf8");
if (!providerUsers.includes("saveToJWT: true")) {
  throw new Error("Provider role must be available to Payload admin access control");
}

const repository = fs.readFileSync("lib/directory/payload-repository.ts", "utf8");
if (
  !repository.includes('collection: "providers"') ||
  !repository.includes('collection: "services"')
) {
  throw new Error("Directory repository must read Payload collections");
}

console.log("Payload runtime and admin boundary checks passed.");
