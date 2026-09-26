import { getPayload } from "payload";
import config from "../payload.config.ts";
import { readRetentionPolicy } from "../lib/privacy/retention-policy.ts";
import { runRetentionAutomation } from "../lib/privacy/retention-executor.ts";

function requireEnabled() {
  if (process.env.TALKPOINT_RETENTION_AUTOMATION_ENABLED?.trim().toLowerCase() !== "true") {
    throw new Error(
      "TALKPOINT_RETENTION_AUTOMATION_ENABLED must be explicitly true before retention automation can run",
    );
  }
}

async function main() {
  requireEnabled();
  const policy = readRetentionPolicy();
  const payload = await getPayload({ config });
  const report = await runRetentionAutomation(payload, policy, new Date());
  console.log(JSON.stringify({ retentionRun: "complete", ...report }));
}

main().catch((error) => {
  console.error("Retention automation failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
