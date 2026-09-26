import {
  getRuntimeMode,
  isSyntheticDirectoryFallbackAllowed,
  validateRuntimeConfiguration,
} from "../lib/config/server.ts";
import { assertAllowedBrowserOrigin } from "../lib/security/http-hardening.ts";

const originalEnv = { ...process.env };

function resetEnv() {
  process.env = { ...originalEnv };
}

function expectThrows(label, fn, pattern) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!pattern.test(message)) {
      throw new Error(`${label} threw unexpected error: ${message}`);
    }
    return;
  }
  throw new Error(`${label} did not fail closed`);
}

try {
  process.env.TALKPOINT_RUNTIME_MODE = "demo";
  process.env.DATABASE_URL = "postgresql://talkpoint:ci-only@127.0.0.1:5432/talkpoint";
  process.env.PAYLOAD_SECRET = "ci-only-not-for-deployment";
  process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK = "true";
  process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD = "true";
  if (getRuntimeMode() !== "demo") throw new Error("Demo runtime mode was not preserved");
  if (!isSyntheticDirectoryFallbackAllowed()) throw new Error("Demo fallback should remain available");
  validateRuntimeConfiguration();

  resetEnv();
  process.env.TALKPOINT_RUNTIME_MODE = "production";
  process.env.DATABASE_URL = "postgresql://talkpoint:strong-password@db.prod.internal:5432/talkpoint";
  process.env.PAYLOAD_SECRET = "a-strong-production-secret-with-more-than-32-characters";
  process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK = "false";
  process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD = "false";
  process.env.TALKPOINT_PUBLIC_APP_ORIGIN = "https://talkpoint.example.test";
  process.env.TALKPOINT_TRUSTED_CLIENT_IP_HEADER = "x-talkpoint-client-ip";
  process.env.TALKPOINT_RATE_LIMIT_HASH_SECRET = "a-dedicated-production-rate-limit-secret-value";
  if (getRuntimeMode() !== "production") throw new Error("Production runtime mode was not preserved");
  if (isSyntheticDirectoryFallbackAllowed()) throw new Error("Production fallback must always be disabled");
  validateRuntimeConfiguration();

  assertAllowedBrowserOrigin(
    new Request("http://internal-app.local/api/provider/requests", {
      method: "PATCH",
      headers: { Origin: "https://talkpoint.example.test" },
    }),
    { requireForCookieAuth: true },
  );
  expectThrows(
    "cross-origin production browser request",
    () =>
      assertAllowedBrowserOrigin(
        new Request("http://internal-app.local/api/provider/requests", {
          method: "PATCH",
          headers: { Origin: "https://cross-origin.invalid" },
        }),
        { requireForCookieAuth: true },
      ),
    /origin/i,
  );
  expectThrows(
    "cookie-authenticated mutation without origin",
    () =>
      assertAllowedBrowserOrigin(
        new Request("http://internal-app.local/api/provider/requests", {
          method: "PATCH",
          headers: { Cookie: "payload-token=synthetic-ci-cookie" },
        }),
        { requireForCookieAuth: true },
      ),
    /same-origin/i,
  );

  delete process.env.TALKPOINT_PUBLIC_APP_ORIGIN;
  expectThrows("missing public app origin", () => validateRuntimeConfiguration(), /public_app_origin/i);
  process.env.TALKPOINT_PUBLIC_APP_ORIGIN = "http://talkpoint.example.test";
  expectThrows("non-HTTPS public app origin", () => validateRuntimeConfiguration(), /public_app_origin/i);
  process.env.TALKPOINT_PUBLIC_APP_ORIGIN = "https://talkpoint.example.test";

  delete process.env.TALKPOINT_TRUSTED_CLIENT_IP_HEADER;
  expectThrows("missing trusted client IP header", () => validateRuntimeConfiguration(), /trusted_client_ip_header/i);
  process.env.TALKPOINT_TRUSTED_CLIENT_IP_HEADER = "x-talkpoint-client-ip";

  delete process.env.TALKPOINT_RATE_LIMIT_HASH_SECRET;
  expectThrows("missing rate-limit hash secret", () => validateRuntimeConfiguration(), /rate_limit_hash_secret/i);
  process.env.TALKPOINT_RATE_LIMIT_HASH_SECRET = "change-me";
  expectThrows("placeholder rate-limit hash secret", () => validateRuntimeConfiguration(), /rate_limit_hash_secret/i);
  process.env.TALKPOINT_RATE_LIMIT_HASH_SECRET = "a-dedicated-production-rate-limit-secret-value";

  process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK = "true";
  expectThrows(
    "production synthetic fallback",
    () => validateRuntimeConfiguration(),
    /synthetic_directory_fallback/i,
  );

  process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK = "false";
  process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD = "true";
  expectThrows("production demo dashboard", () => validateRuntimeConfiguration(), /demo_dashboard/i);

  process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD = "false";
  process.env.PAYLOAD_SECRET = "change-me";
  expectThrows("placeholder production secret", () => validateRuntimeConfiguration(), /payload_secret/i);

  process.env.PAYLOAD_SECRET = "a-strong-production-secret-with-more-than-32-characters";
  process.env.DATABASE_URL = "postgresql://talkpoint:ci-only@127.0.0.1:5432/talkpoint";
  expectThrows("development database in production", () => validateRuntimeConfiguration(), /database_url/i);

  resetEnv();
  delete process.env.TALKPOINT_RUNTIME_MODE;
  process.env.NODE_ENV = "production";
  process.env.DATABASE_URL = "postgresql://talkpoint:strong-password@db.prod.internal:5432/talkpoint";
  process.env.PAYLOAD_SECRET = "a-strong-production-secret-with-more-than-32-characters";
  expectThrows("missing explicit production runtime mode", () => getRuntimeMode(), /runtime_mode/i);

  console.log("Production runtime configuration checks passed.");
} finally {
  process.env = originalEnv;
}
