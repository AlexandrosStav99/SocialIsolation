import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-text px-6 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-5xl">

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left — headline */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">
              You are not alone
            </p>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.08] tracking-tight text-warm-bg">
              Whatever you
              <br />are going through,
              <br />
              <span className="text-clay">connection matters.</span>
            </h2>
          </div>

          {/* Right — copy + CTA */}
          <div>
            <p className="mb-8 text-base leading-relaxed" style={{ color: "#6E756F" }}>
              Explore the university demonstration with fictional text.
              No real support request can be made here. You can stop at any time.
            </p>

            <Link
              href="/check-in"
              className="inline-flex items-center gap-3 rounded-2xl bg-teal px-7 py-4 text-base font-semibold text-white transition hover:opacity-90"
            >
              View demo
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-xs" style={{ color: "#4A5249" }}>
              Demonstration only · No account needed
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}