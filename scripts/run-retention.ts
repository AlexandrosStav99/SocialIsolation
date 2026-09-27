import { getPayload } from "payload";
import config from "../payload.config.ts";
import { readRetentionPolicy } from "../lib/privacy/retention-policy.ts";
import { runRetentionAutomation } from "../lib/privacy/retention-executor.ts";
import { operationalLog } from "../lib/operations/operational-logger.ts";

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
  operationalLog("info", "retention_run_complete", {
    component: "retention",
    status: "complete",
    ...report,
  });
}

main().catch(() => {
  operationalLog("error", "retention_run_failed", {
    component: "retention",
    status: "failed",
    errorCode: "retention_run_failed",
  });
  process.exit(1);
});
