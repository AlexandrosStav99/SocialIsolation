import { connection } from "next/server";
import { notFound } from "next/navigation";
import DashboardPreview from "@/components/DashboardPreview";

// Server-only opt-in for controlled synthetic demonstrations, never authentication.

export default async function DashboardPage() {
  await connection();
  if (process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD !== "true") notFound();
  return <DashboardPreview />;
}
