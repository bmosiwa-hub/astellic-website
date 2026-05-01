"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const workWithUsItems = [
  { label: "Check Openings", href: "/work-with-us" },
  { label: "Propose Partnership", href: "/propose-partnership" },
  { label: "Join Our Roster", href: "/join-our-roster" },
];

const nav = [
  { label: "About", href: "/about" },
  { label: "Our Approach", href: "/approach" },
  { label: "Thematic Areas", href: "/thematic-areas" },
  { label: "Why Astellic", href: "/why-astellic" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);

  return (
    <header className="bg-brand-navy text-white relative z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Astellic"
            width={180}
            height={60}
            className="object-contain h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-lg">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Work With Us dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-lg"
              aria-haspopup="true"
            >
              Work With Us
              <svg
                className="w-4 h-4 mt-0.5 transition-transform group-hover:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown panel */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block">
              <div className="bg-white rounded-xl shadow-xl py-2 min-w-[220px] border border-gray-100">
                {workWithUsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-5 py-3 text-brand-navy text-base font-medium hover:bg-brand-light hover:text-brand-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded text-lg transition-colors"
          >
            Get in Touch
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-brand-navy border-t border-white/10 px-6 pb-4 flex flex-col gap-3 text-lg">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white py-1"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Work With Us expandable */}
          <div>
            <button
              className="flex items-center gap-1 text-gray-300 hover:text-white py-1 w-full text-left text-lg"
              onClick={() => setWorkOpen(!workOpen)}
            >
              Work With Us
              <svg
                className={`w-4 h-4 mt-0.5 ml-1 transition-transform ${workOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {workOpen && (
              <div className="pl-4 flex flex-col gap-2 mt-1 border-l border-white/20">
                {workWithUsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-400 hover:text-white py-1 text-base"
                    onClick={() => { setMobileOpen(false); setWorkOpen(false); }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className="text-gray-300 hover:text-white py-1"
            onClick={() => setMobileOpen(false)}
          >
            Get in Touch
          </Link>
        </nav>
      )}
    </header>
  );
}
