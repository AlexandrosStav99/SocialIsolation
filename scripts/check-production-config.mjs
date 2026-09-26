import {
  getRuntimeMode,
  isSyntheticDirectoryFallbackAllowed,
  validateRuntimeConfiguration,
} from "../lib/config/server.ts";

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
  if (getRuntimeMode() !== "production") throw new Error("Production runtime mode was not preserved");
  if (isSyntheticDirectoryFallbackAllowed()) throw new Error("Production fallback must always be disabled");
  validateRuntimeConfiguration();

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
