// components/HeroSection.tsx

"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function HeroSection() {
  const router = useRouter();

  function handleStartCheckIn() {
    router.push("/check-in");
  }

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

        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: hero-breathe 8s ease-in-out infinite;
        }

        .hero-text {
          animation: hero-fade-in 0.8s ease-out both;
        }

        .hero-text-delay {
          animation: hero-fade-in 0.8s ease-out 0.2s both;
        }

        .hero-text-delay-2 {
          animation: hero-fade-in 0.8s ease-out 0.4s both;
        }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-blob" style={{ width: 500, height: 500, top: "-10%", left: "-10%", background: "#DCA77A", opacity: 0.15 }} />
        <div className="hero-blob" style={{ width: 400, height: 400, bottom: "-5%", right: "20%", background: "#2F6F68", opacity: 0.08, animationDelay: "3s" }} />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="hero-text mb-6 text-sm font-medium tracking-wide text-muted">
            Hey. Whatever brought you here, we&apos;re glad you came.
          </p>

          <h1 className="hero-text-delay mb-8 text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-text">
            You are
            <br />
            <em className="not-italic text-teal">not alone.</em>
          </h1>

          <div className="hero-text-delay-2 max-w-lg">
            <p className="mb-5 text-base leading-relaxed text-muted">
              A private-by-design guided check-in can help you explore support services related to what you choose to share.
            </p>

            <button
              type="button"
              onClick={handleStartCheckIn}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Start anonymous check-in
              <ArrowRight size={14} />
            </button>

            <p className="mt-3 text-xs text-sage">
              No account required. The check-in starts on the next screen.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            {[
              { n: "01", label: "Share what matters" },
              { n: "02", label: "Explore relevant services" },
              { n: "03", label: "Choose what happens next" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal opacity-60">{s.n}</span>
                <span className="text-xs text-muted">{s.label}</span>
                {i < 2 && <span className="mx-1 hidden text-border sm:block">·</span>}
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
