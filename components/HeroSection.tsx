// components/HeroSection.tsx

"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function HeroSection() {
  const router = useRouter();

  function handleStartCheckIn() {
    router.push("/check-in");
  }

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg";

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-warm-bg px-6 pb-16 pt-16 lg:px-16 lg:pt-24">
      <style>{`
        @keyframes hero-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); animation: hero-breathe 8s ease-in-out infinite; }
        .hero-text { animation: hero-fade-in 0.8s ease-out both; }
        .hero-text-delay { animation: hero-fade-in 0.8s ease-out 0.2s both; }
        .hero-text-delay-2 { animation: hero-fade-in 0.8s ease-out 0.4s both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-blob, .hero-text, .hero-text-delay, .hero-text-delay-2 { animation: none !important; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-blob" style={{ width: 500, height: 500, top: "-10%", left: "-10%", background: "#DCA77A", opacity: 0.15 }} />
        <div className="hero-blob" style={{ width: 400, height: 400, bottom: "-5%", right: "20%", background: "#2F6F68", opacity: 0.08, animationDelay: "3s" }} />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <div className="hero-text mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            University MVP · Demonstration environment
          </div>

          <h1 className="hero-text-delay mb-7 text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-text">
            Not sure where
            <br />
            to turn? <em className="not-italic text-teal">Start here.</em>
          </h1>

          <div className="hero-text-delay-2 max-w-xl">
            <p className="mb-7 max-w-lg text-lg leading-relaxed text-muted">
              TalkPoint helps you explore what kind of support may fit your situation and find relevant services, privately and without creating an account.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleStartCheckIn}
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 ${focusRing}`}
              >
                Start the check-in
                <ArrowRight size={15} aria-hidden="true" />
              </button>
              <a
                href="#how-it-works"
                className={`inline-flex items-center justify-center rounded-lg px-3 py-3 text-sm font-semibold text-text underline-offset-4 hover:underline ${focusRing}`}
              >
                See how it works
              </a>
            </div>

            <div className="mt-5 flex max-w-lg items-start gap-2 text-xs leading-relaxed text-muted">
              <LockKeyhole className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
              <p>No account or name is required to explore. Please use fictional text in this demonstration. Real contact requests are disabled.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            {[
              { n: "01", label: "Tell us what matters" },
              { n: "02", label: "Explore relevant support" },
              { n: "03", label: "You choose what happens next" },
            ].map((step, index) => (
              <div key={step.n} className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal opacity-70">{step.n}</span>
                <span className="text-xs text-muted">{step.label}</span>
                {index < 2 && <span className="mx-1 hidden text-border sm:block" aria-hidden="true">·</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <AnimatedLogo />
        </div>
      </div>
    </section>
  );
}
