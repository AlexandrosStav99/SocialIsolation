import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { demoProviders, demoServices } from "@/data/demo-directory";
import { getRuntimeMode, isSyntheticDirectoryFallbackAllowed } from "@/lib/config/server";
import { loadPayloadDemoDirectory } from "@/lib/directory/payload-demo";
import { loadProductionDirectory } from "@/lib/directory/production-directory";
import { securityErrorResponse } from "@/lib/security/api-response";
import { consumeRateLimit, publicRateLimitSubject, rateLimitPolicies } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const runtimeMode = getRuntimeMode();

  if (runtimeMode === "production") {
    try {
      const payload = await getPayload({ config });
      await consumeRateLimit(
        payload,
        rateLimitPolicies.directoryRead,
        publicRateLimitSubject(request),
      );
      const productionDirectory = await loadProductionDirectory(payload);
      if (!productionDirectory) {
        return NextResponse.json(
          { error: "directory_unavailable", providers: [], services: [] },
          { status: 503, headers: noStoreHeaders },
        );
      }
      return NextResponse.json(
        {
          label: "Directory Data",
          source: "payload_postgres_production",
          providers: productionDirectory.providers,
          services: productionDirectory.services,
        },
        { headers: noStoreHeaders },
      );
    } catch (error) {
      const securityResponse = securityErrorResponse(error);
      if (securityResponse) return securityResponse;
      return NextResponse.json(
        { error: "directory_unavailable", providers: [], services: [] },
        { status: 503, headers: noStoreHeaders },
      );
    }
  }

  const payloadDirectory = await loadPayloadDemoDirectory();

  if (payloadDirectory) {
    return NextResponse.json(
      {
        label: "Demonstration Data",
        source: "payload_postgres",
        providers: payloadDirectory.providers,
        services: payloadDirectory.services,
      },
      { headers: noStoreHeaders },
    );
  }

  if (isSyntheticDirectoryFallbackAllowed()) {
    return NextResponse.json(
      {
        label: "Demonstration Data",
        source: "synthetic_fallback",
        providers: demoProviders,
        services: demoServices,
      },
      { headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    {
      error: "directory_unavailable",
      providers: [],
      services: [],
    },
    {
      status: 503,
      headers: noStoreHeaders,
    },
  );
}
