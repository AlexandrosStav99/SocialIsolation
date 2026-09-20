const promises = [
  {
    title: "No account required",
    desc: "Explore the demonstration without an account. Use fictional text only.",
  },
  {
    title: "Anonymous check-in target",
    desc: "The MVP is designed so the anonymous check-in remains separate from any optional contact request.",
  },
  {
    title: "User-directed contact",
    desc: "The MVP will request contact details only when you actively choose an assisted contact flow.",
  },
  {
    title: "Data minimisation",
    desc: "The frozen MVP specification limits collection to data required for navigation or a consented contact request.",
  },
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="bg-warm-bg px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Top line */}
        <div className="mb-10 flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            Privacy first
          </p>

          <p className="hidden text-xs text-muted sm:block">
            Anonymous · Consent-based · Minimal data
          </p>
        </div>

        {/* Main statement */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <h2 className="max-w-4xl text-[clamp(2.4rem,5.5vw,5.8rem)] font-bold leading-[0.96] tracking-tight text-text">
            Privacy is
            <br />
            a design requirement.
          </h2>

          <p className="max-w-md text-base leading-relaxed text-muted lg:pb-3">
            The MVP is being built to minimise personal data, separate anonymous
            navigation from contact requests, and make sharing choices explicit.
          </p>
        </div>

        {/* Quiet quote */}
        <div className="mt-16 border-y border-border py-8">
          <p className="max-w-3xl text-[clamp(1.4rem,3vw,2.4rem)] font-medium leading-[1.25] tracking-tight text-text">
            “The planned check-in will not require an account or a name.”
          </p>
        </div>

        {/* Promise rows */}
        <div className="mt-4">
          {promises.map((p, i) => (
            <div
              key={p.title}
              className="grid grid-cols-1 gap-4 border-b border-border py-7 transition hover:bg-surface/40 sm:grid-cols-[80px_0.8fr_1.2fr] sm:items-start"
            >
              <span className="text-xs font-bold text-teal opacity-50">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="text-base font-bold tracking-tight text-text">
                {p.title}
              </h3>

              <p className="max-w-xl text-sm leading-relaxed text-muted">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-sage">
            Privacy and consent behaviours remain subject to implementation and
            validation before any real-world deployment.
          </p>

          <div className="w-fit rounded-full border border-border px-4 py-2 text-xs font-medium text-muted">
            MVP privacy target
          </div>
        </div>
      </div>
    </section>
  );
}

