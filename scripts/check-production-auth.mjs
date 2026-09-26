import fs from "node:fs";

const users = fs.readFileSync("payload/collections/ProviderUsers.ts", "utf8");
for (const marker of [
  "tokenExpiration",
  "maxLoginAttempts: 5",
  "lockTime",
  "removeTokenFromResponses: true",
  "useSessions: true",
  "useAPIKey: false",
  'sameSite: "Lax"',
  'getRuntimeMode() === "production"',
  "forgotPassword",
  "minRequestInterval",
  "minLength: PASSWORD_MIN_LENGTH",
  'name: "active"',
  "saveToJWT: true",
  "This account is inactive",
  "sessions = []",
  "final active super admin",
]) {
  if (!users.includes(marker)) throw new Error("Production auth hardening marker missing: " + marker);
}

const access = fs.readFileSync("payload/access.ts", "utf8");
for (const marker of ["active?: boolean", "candidate?.active !== false", "superAdminOnly"]) {
  if (!access.includes(marker)) throw new Error("Deactivated-account RBAC marker missing: " + marker);
}

const migration = fs.readFileSync("migrations/20260926_152500_auth_hardening.ts", "utf8");
for (const marker of [
  'ADD COLUMN "active" boolean DEFAULT false NOT NULL',
  'UPDATE "provider_users" SET "active" = true',
]) {
  if (!migration.includes(marker)) throw new Error("Auth migration marker missing: " + marker);
}

const index = fs.readFileSync("migrations/index.ts", "utf8");
if (!index.includes("20260926_152500_auth_hardening")) {
  throw new Error("Authentication migration must be registered");
}

console.log("Production authentication hardening checks passed.");
