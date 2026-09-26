import fs from "node:fs";

const users = fs.readFileSync("payload/collections/ProviderUsers.ts", "utf8");
const access = fs.readFileSync("payload/access.ts", "utf8");
const config = fs.readFileSync("payload.config.ts", "utf8");

for (const marker of [
  "tokenExpiration: SESSION_SECONDS",
  "useSessions: true",
  "removeTokenFromResponses: true",
  "maxLoginAttempts: 5",
  "lockTime: LOCK_TIME_MS",
  "forgotPassword",
  "minRequestInterval: 60_000",
  'sameSite: "Strict"',
  'process.env.TALKPOINT_RUNTIME_MODE === "production"',
  "PASSWORD_MIN_LENGTH = 12",
]) {
  if (!users.includes(marker)) throw new Error(`Missing production auth hardening invariant: ${marker}`);
}

if (!config.includes('user: "provider-users"')) {
  throw new Error("Payload Admin authentication collection changed unexpectedly");
}

for (const marker of ["superAdminOnly", "readSelfOrSuperAdmin", "providerUserAdminCollection"]) {
  if (!access.includes(marker)) throw new Error(`Missing provider-user privilege boundary: ${marker}`);
}

if (!users.includes('saveToJWT: true')) {
  throw new Error("Role must remain available to authenticated access control");
}
if (!users.includes("Provider roles require organisation scope")) {
  throw new Error("Provider users must remain organisation-scoped");
}
if (!users.includes("Platform roles must not have provider organisation scope")) {
  throw new Error("Platform roles must remain outside provider organisation scope");
}

console.log("Production authentication hardening checks passed.");
