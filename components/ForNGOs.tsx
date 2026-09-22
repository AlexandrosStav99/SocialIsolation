import { ArrowUpRight } from "lucide-react";

const features = [
  {
    n: "01",
    title: "Consented contact requests",
    desc: "A structured foundation for user-directed requests that shares controlled information only after the required consent step.",
  },
  {
    n: "02",
    title: "Understand support demand",
    desc: "Privacy-safe aggregate foundations can help reveal which support topics people are looking for without exposing individual journeys.",
  },
  {
    n: "03",
    title: "See regional patterns",
    desc: "District-level aggregate foundations use minimum-sample suppression rather than individual user locations.",
  },
  {
    n: "04",
    title: "Manage incoming requests",
    desc: "Provider workflow foundations support assigning and updating consented demonstration contact requests.",
  },
];

export default function ForNGOs() {
  return (
    <section id="for-ngos" className="relative overflow-hidden bg-surface px-6 py-24 lg:px-16">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full blur-3xl" style={{ background: "#2F6F6814" }} />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 inline-flex items-center rounded-full border border-border bg-warm-bg px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">For support organisations</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="max-w-3xl text-[clamp(2.4rem,5vw,5rem)] font-bold leading-[0.98] tracking-tight text-text">
            Help people find you.
            <br />
            Understand what
            <br />
            they need.
          </h2>

          <div className="max-w-xl lg:pb-2">
            <p className="text-base leading-relaxed text-muted">
              TalkPoint explores how support organisations could receive clearer, user-directed requests while learning from privacy-safe aggregate patterns in unmet and emerging support needs.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The current university MVP uses demonstration data and sends no real contact requests.
            </p>
            <a
              href="mailto:hello@talkpoint.cy"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Contact TalkPoint
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-border bg-warm-bg p-6 shadow-sm">
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-text">Example demand overview</p>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">Illustrative data</span>
            </div>

            <div className="space-y-5">
              {[
                { label: "Emotional support", value: "72%" },
                { label: "Social connection", value: "54%" },
                { label: "Academic stress", value: "38%" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted">{item.label}</span>
                    <span className="font-semibold text-teal">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                    <div className="h-full rounded-full bg-teal" style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs leading-relaxed text-muted">
                Illustrative values only. The MVP analytics foundation uses thresholded aggregates and does not plot individual users.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.n} className="group rounded-[1.5rem] border border-border bg-warm-bg p-6 transition duration-300 hover:-translate-y-1 hover:shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal opacity-70">{feature.n}</span>
                  <span className="h-2 w-2 rounded-full bg-teal opacity-50 transition group-hover:opacity-100" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-base font-bold tracking-tight text-text">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
