"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy", href: "/#privacy" },
  { label: "For NGOs", href: "/#for-ngos" },
  { label: "About us", href: "/about" },
];

export default function Navbar() {

  const [open, setOpen] = useState(false);
  const [hideLinks, setHideLinks] = useState(false);


  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {

      setHideLinks(true);

      clearTimeout(timer);

      timer = setTimeout(() => {
        setHideLinks(false);
      }, 400);

    };


    window.addEventListener("scroll", handleScroll);


    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };

  }, []);



  return (
    <header
      className="
      sticky 
      top-0 
      z-[999]
      w-full

      bg-warm-bg/90
      backdrop-blur-xl

      border-b 
      border-border
      shadow-sm
      "
    >

      <div
        className="
        mx-auto
        flex
        max-w-6xl
        items-center
        justify-between
        px-5
        py-3
        "
      >


        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3"
        >

          <Image
            src="/Logo.svg"
            alt="TalkPoint Logo"
            width={90}
            height={60}
            style={{scale: 1.5}}
          />


          <span
            className="
            text-base
            font-semibold
            tracking-tight
            text-text
            "
            style={{scale: 1.5}}
          >
            Talk
            <span className="text-teal">
              Point
            </span>
          </span>

        </Link>



        {/* Desktop links */}
        <nav
          className={`
          hidden
          items-center
          gap-7
          md:flex

          transition-all
          duration-300

          ${
            hideLinks
              ? "opacity-0 -translate-y-3 pointer-events-none"
              : "opacity-100 translate-y-0"
          }
          `}
        >

          {navLinks.map((l) => (

            <Link
              key={l.href}
              href={l.href}
              className="
              text-sm
              text-muted
              transition
              hover:text-text
              "
            >

              {l.label}

            </Link>

          ))}

        </nav>




        {/* CTA */}
        <div
          className="
          hidden
          md:flex
          items-center
          gap-3
          "
        >

          <Link
            href="/check-in"
            className="
            rounded-xl
            bg-teal
            px-5
            py-2.5

            text-sm
            font-semibold
            text-white

            transition
            hover:opacity-90
            "
          >

            View demo

          </Link>

        </div>




        {/* Mobile menu button */}
        <button
          className="
          flex
          md:hidden
          items-center
          justify-center

          rounded-lg
          p-2

          transition
          hover:bg-black/5
          "

          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >

          {
            open

            ? <X 
                size={20} 
                className="text-text" 
              />

            : <Menu 
                size={20} 
                className="text-text" 
              />
          }

        </button>

      </div>





      {/* Mobile menu */}
      {open && (

        <div
          className="
          border-t
          border-border
          bg-warm-bg

          md:hidden
          "
        >

          <div
            className="
            flex
            flex-col
            gap-1

            px-5
            py-4
            "
          >

            {navLinks.map((l) => (

              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}

                className="
                rounded-lg
                px-3
                py-2.5

                text-sm
                text-text

                transition
                hover:bg-black/5
                "
              >

                {l.label}

              </Link>

            ))}


            <Link
              href="/check-in"

              onClick={() => setOpen(false)}

              className="
              mt-2

              rounded-xl
              bg-teal

              px-5
              py-3

              text-center
              text-sm
              font-semibold
              text-white

              transition
              hover:opacity-90
              "
            >

              View demo

            </Link>

          </div>

        </div>

      )}

    </header>
  );
}