import Link from "next/link";

export default function Footer() {
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg";

  return (
    <footer className="border-t border-border bg-warm-bg px-6 py-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-base font-semibold tracking-tight text-text">
              Talk<span className="text-teal">Point</span>
            </span>
          </div>
          <p className="text-xs text-muted">Safe first. Data second. Human always.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            { label: "How it works", href: "/#how-it-works" },
            { label: "Privacy", href: "/#privacy" },
            { label: "For NGOs", href: "/#for-ngos" },
            { label: "About", href: "/about" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md text-sm text-muted transition hover:text-text ${focusRing}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="whitespace-nowrap text-xs text-muted">
          &copy; {new Date().getFullYear()} TalkPoint · Cyprus
        </p>
      </div>
    </footer>
  );
}
