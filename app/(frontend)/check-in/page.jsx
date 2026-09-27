import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntegratedCheckIn from "@/components/check-in/IntegratedCheckIn";
import { getRuntimeMode } from "@/lib/config/server";
import { demoSafetyPresentation } from "@/lib/safety/content";
import { tryGetApprovedProductionPrivacyConfiguration } from "@/lib/privacy/production-config";
import { tryGetApprovedProductionSafetyPresentation } from "@/lib/safety/production-config";

export default function CheckInPage() {
  const runtimeMode = getRuntimeMode();
  const production = runtimeMode === "production";
  const safetyPresentation = production
    ? tryGetApprovedProductionSafetyPresentation()
    : demoSafetyPresentation;
  const privacyConfiguration = production
    ? tryGetApprovedProductionPrivacyConfiguration()
    : null;

  if (!safetyPresentation || (production && !privacyConfiguration)) {
    return (
      <>
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-[calc(100vh-10rem)] bg-warm-bg px-5 py-16"
        >
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-text">TalkPoint check-in is temporarily unavailable</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The check-in is not available in this production environment right now. Please try again later.
            </p>
            <p lang="el" className="mt-3 text-sm leading-relaxed text-muted">
              Το check-in δεν είναι διαθέσιμο σε αυτό το περιβάλλον παραγωγής αυτή τη στιγμή. Δοκίμασε ξανά αργότερα.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <IntegratedCheckIn
        experienceMode={production ? "production" : "demo"}
        safetyPresentation={safetyPresentation}
        privacyNotice={privacyConfiguration?.notice ?? null}
      />
      <Footer />
    </>
  );
}
