"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const nav = [
  { label: "About", href: "/about" },
  { label: "Our Approach", href: "/approach" },
  { label: "Thematic Areas", href: "/thematic-areas" },
  { label: "Why Astellic", href: "/why-astellic" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-brand-navy text-white">
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
        <nav className="hidden md:flex items-center gap-8 text-base">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white px-5 py-2.5 rounded text-base transition-colors"
          >
            Get in Touch
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-brand-navy border-t border-white/10 px-6 pb-4 flex flex-col gap-3 text-base">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white py-1"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
