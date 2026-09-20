import fs from "node:fs";

const route = fs.readFileSync("app/api/demo-handoff/route.ts", "utf8");
if (!route.includes("consentAccepted")) throw new Error("Demo handoff must require explicit consent");
if (route.includes("providerOrganisationId?:string") || route.includes("providerOrganisationId?: string")) {
  throw new Error("Demo handoff must not trust provider organisation from client input");
}
if (!route.includes("DEMO_SERVICES")) throw new Error("Canonical demo service mapping is required");
if (!route.includes("Unknown demonstration service")) throw new Error("Unknown service rejection is required");
if (!route.includes("accepted: body.consentAccepted")) throw new Error("Consent must flow from explicit client confirmation");

const access = fs.readFileSync("lib/security/access-scope.ts", "utf8");
if (!access.includes('return false')) throw new Error("Platform roles must not inherit identifiable request access");
if (!access.includes("actor.organisationId === requestOrganisationId")) {
  throw new Error("Provider request access must remain organisation-scoped");
}

console.log("Provider RBAC and consent hardening checks passed.");
