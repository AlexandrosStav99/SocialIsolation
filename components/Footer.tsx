import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-warm-bg px-6 py-10 lg:px-16">
      <div className="mx-auto max-w-5xl flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo + tagline */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* ΒΑΛΕ ΕΔΩ ΤΟ LOGO ΣΟΥ */}
            <span className="text-base font-semibold tracking-tight text-text">
              Talk<span className="text-teal">Point</span>
            </span>
          </div>
          <p className="text-xs text-sage">
            Safe first. Data second. Human always.
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            { label: "How it works", href: "/#how-it-works" },
            { label: "Privacy", href: "/#privacy" },
            { label: "For NGOs", href: "/#for-ngos" },
            { label: "About", href: "/about" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Legal */}
        <p className="text-xs text-sage whitespace-nowrap">
          &copy; {new Date().getFullYear()} TalkPoint · Cyprus
        </p>

      </div>
    </footer>
  );
}