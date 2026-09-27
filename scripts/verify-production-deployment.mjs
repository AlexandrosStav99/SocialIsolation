function requireProductionOrigin(raw) {
  if (!raw) throw new Error("Production deployment verification origin is required");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Production deployment verification origin must be an absolute URL");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "Production deployment verification target must be an HTTPS origin without credentials, path, query or fragment",
    );
  }
  return parsed.origin;
}

async function verifyHealth(origin, path, expectedStatus) {
  const response = await fetch(origin + path, {
    method: "GET",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: "application/json" },
  });
  if (response.status !== 200) {
    throw new Error(path + " returned HTTP " + response.status);
  }
  const body = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    body.status !== expectedStatus
  ) {
    throw new Error(path + " returned an unexpected health payload");
  }
  const cacheControl = response.headers.get("cache-control") ?? "";
  if (!cacheControl.toLowerCase().includes("no-store")) {
    throw new Error(path + " must be non-cacheable");
  }
  if (response.headers.get("x-content-type-options") !== "nosniff") {
    throw new Error(path + " is missing the baseline response security headers");
  }
}

async function main() {
  const origin = requireProductionOrigin(
    process.argv[2] ?? process.env.TALKPOINT_DEPLOY_VERIFY_ORIGIN,
  );
  await verifyHealth(origin, "/api/health/live", "ok");
  await verifyHealth(origin, "/api/health/ready", "ready");
  console.log(JSON.stringify({ deploymentVerification: "passed", origin }));
}

main().catch(() => {
  console.error(JSON.stringify({ deploymentVerification: "failed" }));
  process.exit(1);
});
