const promises = [
  {
    title: "Explore without an account",
    desc: "You do not need to create an account or provide your name to use the demonstration check-in.",
  },
  {
    title: "Anonymous exploration stays separate",
    desc: "The check-in is designed as a separate anonymous domain from any optional identifiable contact request.",
  },
  {
    title: "You choose whether to connect",
    desc: "Contact details are requested only if you actively choose an assisted contact flow. Real requests are disabled in this public demonstration.",
  },
  {
    title: "Only necessary data",
    desc: "The MVP limits collection to information needed for support navigation or a contact request you explicitly consent to.",
  },
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="bg-warm-bg px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Privacy by design</p>
          <p className="hidden text-xs text-muted sm:block">Anonymous first · User-controlled · Minimal data</p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <h2 className="max-w-4xl text-[clamp(2.4rem,5.5vw,5.8rem)] font-bold leading-[0.96] tracking-tight text-text">
            Explore first.
            <br />
            Share only if you choose.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted lg:pb-3">
            TalkPoint is built around a simple boundary: exploring support should not require you to identify yourself. An identifiable step is separate and user-directed.
          </p>
        </div>

        <div className="mt-16 border-y border-border py-8">
          <p className="max-w-3xl text-[clamp(1.4rem,3vw,2.4rem)] font-medium leading-[1.25] tracking-tight text-text">
            “No account or name is required to explore the check-in.”
          </p>
        </div>

        <div className="mt-4">
          {promises.map((promise, index) => (
            <div key={promise.title} className="grid grid-cols-1 gap-4 border-b border-border py-7 transition hover:bg-surface/40 sm:grid-cols-[80px_0.8fr_1.2fr] sm:items-start">
              <span className="text-xs font-bold text-teal opacity-70">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-base font-bold tracking-tight text-text">{promise.title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted">{promise.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-muted">
            This is a university demonstration. Privacy and consent behaviour must be fully validated before any real-world deployment, and you should enter fictional text only here.
          </p>
          <div className="w-fit rounded-full border border-border px-4 py-2 text-xs font-medium text-muted">University MVP</div>
        </div>
      </div>
    </section>
  );
}
