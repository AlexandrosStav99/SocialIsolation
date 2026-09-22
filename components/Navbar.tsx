"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy", href: "/#privacy" },
  { label: "For NGOs", href: "/#for-ngos" },
  { label: "About us", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => toggleRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg";

  return (
    <header className="sticky top-0 z-[999] w-full border-b border-border bg-warm-bg/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className={`flex items-center gap-3 rounded-lg ${focusRing}`}>
          <Image
            src="/Logo.svg"
            alt=""
            width={90}
            height={60}
            style={{ scale: 1.5 }}
          />
          <span className="text-base font-semibold tracking-tight text-text" style={{ scale: 1.5 }}>
            Talk<span className="text-teal">Point</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-1 py-2 text-sm text-muted transition hover:text-text ${focusRing}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/check-in"
            className={`rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${focusRing}`}
          >
            Start the check-in
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg transition hover:bg-black/5 md:hidden ${focusRing}`}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-primary-navigation"
        >
          {open ? <X size={20} className="text-text" aria-hidden="true" /> : <Menu size={20} className="text-text" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-primary-navigation"
          aria-label="Mobile primary"
          className="border-t border-border bg-warm-bg md:hidden"
        >
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`min-h-11 rounded-lg px-3 py-2.5 text-sm text-text transition hover:bg-black/5 ${focusRing}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/check-in"
              onClick={() => setOpen(false)}
              className={`mt-2 min-h-12 rounded-xl bg-teal px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 ${focusRing}`}
            >
              Start the check-in
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
