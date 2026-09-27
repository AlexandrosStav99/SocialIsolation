import { sql } from "@payloadcms/db-postgres/drizzle";
import type { Payload } from "payload";
import { validateRuntimeConfiguration } from "../config/server.ts";
import { operationalLog } from "./operational-logger.ts";

export async function checkApplicationReadiness(payload: Payload): Promise<boolean> {
  try {
    validateRuntimeConfiguration();
    await payload.db.drizzle.execute(sql`SELECT 1 FROM "contact_requests" LIMIT 0`);
    await payload.db.drizzle.execute(sql`SELECT 1 FROM "api_rate_limit_buckets" LIMIT 0`);
    return true;
  } catch {
    operationalLog("error", "readiness_check_failed", {
      component: "application_readiness",
      status: "not_ready",
      errorCode: "dependency_unavailable",
    });
    return false;
  }
}
