import fs from "node:fs";

const required = [
  "payload.config.ts",
  "payload/collections/ProviderOrganisations.ts",
  "payload/collections/Providers.ts",
  "payload/collections/Services.ts",
  "lib/directory/payload-repository.ts",
];
for (const path of required) {
  if (!fs.existsSync(path)) throw new Error(`Missing Payload runtime file: ${path}`);
}
const config = fs.readFileSync("payload.config.ts", "utf8");
if (!config.includes("postgresAdapter") || !config.includes("getDatabaseUrl")) throw new Error("Payload must use server-side PostgreSQL configuration");
const repository = fs.readFileSync("lib/directory/payload-repository.ts", "utf8");
if (!repository.includes('collection: "providers"') || !repository.includes('collection: "services"')) throw new Error("Directory repository must read Payload collections");
console.log("Payload runtime foundation checks passed.");
