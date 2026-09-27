import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { checkApplicationReadiness } from "@/lib/operations/health";
import { noStoreHeaders } from "@/lib/security/http-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const ready = await checkApplicationReadiness(payload);
    return NextResponse.json(
      { status: ready ? "ready" : "not_ready" },
      { status: ready ? 200 : 503, headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      { status: "not_ready" },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
