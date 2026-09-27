import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/security/http-hardening";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok" }, { headers: noStoreHeaders });
}
