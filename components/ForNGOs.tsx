import { ArrowUpRight } from "lucide-react";

const features = [
  {
    n: "01",
    title: "Structured intake requests",
    desc: "Planned workflow for consented contact requests with controlled support-topic summaries.",
  },
  {
    n: "02",
    title: "Demand analytics",
    desc: "Planned aggregate analytics for support topics and trends, using demonstration data in the university MVP.",
  },
  {
    n: "03",
    title: "Regional insights",
    desc: "Planned district-level aggregate trends with minimum-sample suppression and no individual locations.",
  },
  {
    n: "04",
    title: "Request management",
    desc: "Planned provider workflow for assigning and updating consented demo contact requests.",
  },
];

export default function ForNGOs() {
  return (
    <section id="for-ngos" className="relative overflow-hidden bg-surface px-6 py-24 lg:px-16">
      {/* Soft background detail */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "#2F6F6814" }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center rounded-full border border-border bg-warm-bg px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            For support organizations
          </span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="max-w-3xl text-[clamp(2.4rem,5vw,5rem)] font-bold leading-[0.98] tracking-tight text-text">
            Better visibility
            <br />
            into the needs
            <br />
            you serve.
          </h2>

          <div className="max-w-xl lg:pb-2">
            <p className="text-base leading-relaxed text-muted">
              The university MVP is designed to demonstrate how NGOs, universities, and community services could receive user-directed requests and view aggregate support-topic trends.
            </p>

            <a
              href="mailto:hello@talkpoint.cy"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Contact TalkPoint
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Insight panel */}
          <div className="rounded-[2rem] border border-border bg-warm-bg p-6 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-text">Demand overview</p>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-sage">
                Demonstration Data
              </span>
            </div>

            <div className="space-y-5">
              {[
                { label: "Emotional support", value: "72%" },
                { label: "Social connection", value: "54%" },
                { label: "Academic stress", value: "38%" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted">{item.label}</span>
                    <span className="font-semibold text-teal">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: item.value }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs leading-relaxed text-muted">
                Illustrative values only. The completed MVP will use thresholded aggregate analytics and will not plot individual users.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.n}
                className="group rounded-[1.5rem] border border-border bg-warm-bg p-6 transition duration-300 hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal opacity-60">
                    {f.n}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-teal opacity-40 transition group-hover:opacity-100" />
                </div>

                <h3 className="mb-3 text-base font-bold tracking-tight text-text">
                  {f.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}