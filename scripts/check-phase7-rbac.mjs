import fs from "node:fs";
const scope=fs.readFileSync("lib/security/access-scope.ts","utf8");const queue=fs.readFileSync("lib/provider/queue.ts","utf8");const permissions=fs.readFileSync("lib/provider/permissions.ts","utf8");const workflow=fs.readFileSync("lib/provider/workflow.ts","utf8");const audit=fs.readFileSync("lib/provider/audit.ts","utf8");
if(!scope.includes("return false")) throw new Error("Platform roles must not inherit identifiable-request access");
for(const x of ["providerOrganisationId!==actor.organisationId","assertProviderRequestAccess"]) if(!queue.includes(x)) throw new Error("Queue isolation missing: "+x);
if(!permissions.includes("provider_manager")||!permissions.includes("provider_staff")) throw new Error("Provider roles missing");
for(const status of ["assigned","contact_attempted","contacted","accepted","closed","unable_to_reach","referred_elsewhere","user_declined"]) if(!workflow.includes(status)) throw new Error("Workflow status missing: "+status);
for(const forbidden of ["contactDetail","preferredName","structuredSupportSummary","optionalNote"]) if(audit.includes(forbidden)) throw new Error("Audit event contains sensitive payload field: "+forbidden);
console.log("Phase 7 RBAC/provider-workspace checks passed.");
