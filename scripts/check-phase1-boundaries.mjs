import fs from "node:fs";

const sql = fs.readFileSync("db/migrations/0001_phase1_boundaries.sql", "utf8");
const analyticsBlock = sql.match(/CREATE TABLE anonymous_analytics_events \(([\s\S]*?)\n\);/)?.[1];
if (!analyticsBlock) throw new Error("anonymous_analytics_events table missing");

for (const forbidden of ["session_id", "request_id", "user_id", "contact_detail", "email", "phone", "free_text"]) {
  const column = new RegExp("^\\s*" + forbidden + "\\s+", "m");
  if (column.test(analyticsBlock)) throw new Error("Forbidden anonymous analytics column: " + forbidden);
}

const logger = fs.readFileSync("lib/security/redacted-logger.ts", "utf8");
for (const required of ["freeText", "contactDetail", "preferredName", "structuredSupportSummary", "prompt", "response", "email", "phone"]) {
  if (!logger.includes('"' + required + '"')) throw new Error("Logger redaction missing: " + required);
}

const access = fs.readFileSync("lib/security/access-scope.ts", "utf8");
if (!access.includes('return false')) throw new Error("Platform admin identifiable-request denial missing");

console.log("Phase 1 privacy/data-boundary checks passed.");
