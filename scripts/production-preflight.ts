import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  getRuntimeMode,
  validateRuntimeConfiguration,
} from "../lib/config/server.ts";
import { checkApplicationReadiness } from "../lib/operations/health.ts";
import { getApprovedProductionSafetyPresentation } from "../lib/safety/production-config.ts";
import { getApprovedProductionPrivacyConfiguration } from "../lib/privacy/production-config.ts";
import { operationalLog } from "../lib/operations/operational-logger.ts";

async function main() {
  if (getRuntimeMode() !== "production") {
    throw new Error("Production deployment preflight requires TALKPOINT_RUNTIME_MODE=production");
  }

  validateRuntimeConfiguration();
  getApprovedProductionSafetyPresentation();
  getApprovedProductionPrivacyConfiguration();
  const payload = await getPayload({ config });
  const ready = await checkApplicationReadiness(payload);
  if (!ready) {
    throw new Error("Production deployment preflight readiness failed");
  }

  operationalLog("info", "deployment_preflight_ready", {
    component: "deployment_preflight",
    status: "ready",
    runtimeMode: "production",
  });
  process.exit(0);
}

main().catch(() => {
  operationalLog("error", "deployment_preflight_failed", {
    component: "deployment_preflight",
    status: "failed",
    errorCode: "deployment_preflight_failed",
  });
  process.exit(1);
});
