import { NextResponse } from "next/server";
import { demoProviders, demoServices } from "@/data/demo-directory";
import { getRuntimeMode, isSyntheticDirectoryFallbackAllowed } from "@/lib/config/server";
import { loadPayloadDemoDirectory } from "@/lib/directory/payload-demo";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  const runtimeMode = getRuntimeMode();

  // Until verified real-provider onboarding exists, production must never expose
  // the synthetic university directory, even when those records exist in Payload.
  const payloadDirectory = runtimeMode === "production" ? null : await loadPayloadDemoDirectory();

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
