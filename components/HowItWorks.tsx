import { ArrowDownRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Share how you feel",
    desc: "Planned: choose broad support topics without creating an account. The current demo uses fictional text only.",
  },
  {
    n: "02",
    title: "Explore support services",
    desc: "Planned: deterministic rules will find checked service information using your structured choices. This is not implemented yet.",
  },
  {
    n: "03",
    title: "Connect when you're ready",
    desc: "Planned: choose self-service contact or an explicitly consented request to a participating service. No requests are sent by this demo.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-warm-bg px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Sticky intro */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              Planned journey
            </p>

            <h2 className="max-w-xl text-[clamp(2.6rem,5vw,5.6rem)] font-bold leading-[0.96] tracking-tight text-text">
              A calm path
              <br />
              from feeling
              <br />
              to support.
            </h2>

            <p className="mt-8 max-w-sm text-base leading-relaxed text-muted">
              No pressure. No rushed decisions. Just a simple flow that helps
              you understand what you need and what support is available.
            </p>

            <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-full border border-border text-teal">
              <ArrowDownRight size={18} />
            </div>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Vertical thread */}
            <div
              aria-hidden
              className="absolute left-[18px] top-3 hidden h-[calc(100%-24px)] w-px bg-border sm:block"
            />

            <div className="space-y-4">
              {steps.map((step, i) => (
                <article
                  key={step.n}
                  className="relative grid grid-cols-1 gap-6 border-t border-border py-12 sm:grid-cols-[64px_1fr]"
                >
                  <div className="relative z-10 flex items-start">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-warm-bg text-xs font-bold text-teal">
                      {step.n}
                    </span>
                  </div>

                  <div className="max-w-2xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                      Step {i + 1}
                    </p>

                    <h3 className="text-[clamp(1.8rem,3vw,3rem)] font-bold leading-[1.05] tracking-tight text-text">
                      {step.title}
                    </h3>

                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                      {step.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Closing privacy note */}
            <div className="mt-8 border-y border-border py-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[160px_1fr] sm:items-start">
                <p className="text-sm font-bold text-text">Safe first.</p>

                <p className="max-w-2xl text-sm leading-relaxed text-muted">
                  Privacy, consent and data boundaries require implementation and validation.
                  Do not enter personal information into this demonstration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
