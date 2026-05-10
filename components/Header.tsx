"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const thematicAreas = [
  { label: "Health & Nutrition Systems", href: "/thematic-areas/health" },
  { label: "Governance & Public Sector Reform", href: "/thematic-areas/governance" },
  { label: "Climate, Agriculture & Sustainability", href: "/thematic-areas/climate" },
  { label: "Human Development & Social Systems", href: "/thematic-areas/education" },
];

const ourApproachItems = [
  {
    label: "Evidence Generation & Verification",
    sub: "Pillar 01",
    href: "/what-we-do/evidence",
    dot: "bg-brand-navy",
  },
  {
    label: "Policy Development & Advisory",
    sub: "Pillar 02",
    href: "/what-we-do/policy",
    dot: "bg-brand-teal",
  },
  {
    label: "Programme Design & Implementation",
    sub: "Pillar 03",
    href: "/what-we-do/implementation",
    dot: "bg-brand-green",
  },
];

const workWithUsItems = [
  { label: "Check Openings", href: "/work-with-us" },
  { label: "Propose Partnership", href: "/propose-partnership" },
  { label: "Join Our Roster", href: "/join-our-roster" },
];

const whoWeAreItems = [
  { label: "About Astellic", href: "/about" },
  { label: "Vision & Mission", href: "/about/vision-mission" },
  { label: "Our Team", href: "/about/our-team" },
];

/* ── Simple flat dropdown ── */
function FlatDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  return (
    <div className="relative group hidden md:block">
      <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-lg" aria-haspopup="true">
        {label}
        <svg className="w-4 h-4 mt-0.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50">
        <div className="bg-white rounded-xl shadow-xl py-2 min-w-[220px] border border-gray-100">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="block px-5 py-3 text-brand-navy text-base font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Our Work dropdown with nested flyouts ── */
function OurWorkDropdown() {
  return (
    <div className="relative group hidden md:block">
      <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-lg" aria-haspopup="true">
        Our Work
        <svg className="w-4 h-4 mt-0.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50">
        <div className="bg-white rounded-xl shadow-xl py-2 min-w-[240px] border border-gray-100">

          {/* Our Approach — nested flyout with pillars */}
          <div className="relative group/approach">
            <div className="flex items-center justify-between px-5 py-3 hover:bg-brand-light cursor-pointer">
              <Link href="/what-we-do" className="text-brand-navy text-base font-medium hover:text-brand-gold transition-colors flex-1">
                Our Approach
              </Link>
              <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Pillar flyout */}
            <div className="absolute left-full top-0 pl-1 hidden group-hover/approach:block z-50">
              <div className="bg-white rounded-xl shadow-xl py-2 min-w-[290px] border border-gray-100">
                <p className="px-5 pt-2 pb-1 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Three Pillars</p>
                {ourApproachItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-brand-light transition-colors group/item"
                  >
                    <span className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-brand-muted">{item.sub}</p>
                      <p className="text-sm font-medium text-brand-navy group-hover/item:text-brand-gold transition-colors leading-snug">
                        {item.label}
                      </p>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link href="/what-we-do" className="block px-5 py-2.5 text-brand-gold text-sm font-semibold hover:bg-brand-light transition-colors">
                    View full architecture →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Thematic Areas — nested flyout */}
          <div className="relative group/thematic">
            <div className="flex items-center justify-between px-5 py-3 hover:bg-brand-light cursor-pointer">
              <Link href="/thematic-areas" className="text-brand-navy text-base font-medium hover:text-brand-gold transition-colors flex-1">
                Thematic Areas
              </Link>
              <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Flyout */}
            <div className="absolute left-full top-0 pl-1 hidden group-hover/thematic:block z-50">
              <div className="bg-white rounded-xl shadow-xl py-2 min-w-[280px] border border-gray-100">
                {thematicAreas.map((area) => (
                  <Link key={area.href} href={area.href} className="block px-5 py-3 text-brand-navy text-base font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
                    {area.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/our-projects" className="block px-5 py-3 text-brand-navy text-base font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
            Our Projects
          </Link>
          <Link href="/resources" className="block px-5 py-3 text-brand-navy text-base font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
            Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [whoWeAreOpen, setWhoWeAreOpen] = useState(false);
  const [ourWorkOpen, setOurWorkOpen] = useState(false);
  const [approachOpen, setApproachOpen] = useState(false);
  const [thematicOpen, setThematicOpen] = useState(false);
  const [workWithUsOpen, setWorkWithUsOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setWhoWeAreOpen(false);
    setOurWorkOpen(false);
    setApproachOpen(false);
    setThematicOpen(false);
    setWorkWithUsOpen(false);
  };

  return (
    <header className="bg-brand-navy text-white relative z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Astellic" width={180} height={60} className="object-contain h-14 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-lg">
          <FlatDropdown label="Who We Are" items={whoWeAreItems} />
          <Link href="/why-astellic" className="text-gray-300 hover:text-white transition-colors">Why Astellic</Link>
          <OurWorkDropdown />
          <FlatDropdown label="Work With Us" items={workWithUsItems} />
          <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded text-lg transition-colors">
            Get in Touch
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-brand-navy border-t border-white/10 px-6 pb-4 flex flex-col gap-3 text-lg">

          {/* Who We Are */}
          <div>
            <button className="flex items-center gap-1 text-gray-300 hover:text-white py-1 w-full text-left text-lg" onClick={() => setWhoWeAreOpen(!whoWeAreOpen)}>
              Who We Are
              <svg className={`w-4 h-4 ml-1 transition-transform ${whoWeAreOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {whoWeAreOpen && (
              <div className="pl-4 flex flex-col gap-2 mt-1 border-l border-white/20">
                {whoWeAreItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/why-astellic" className="text-gray-300 hover:text-white py-1" onClick={closeMobile}>
            Why Astellic
          </Link>

          {/* Our Work */}
          <div>
            <button className="flex items-center gap-1 text-gray-300 hover:text-white py-1 w-full text-left text-lg" onClick={() => setOurWorkOpen(!ourWorkOpen)}>
              Our Work
              <svg className={`w-4 h-4 ml-1 transition-transform ${ourWorkOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {ourWorkOpen && (
              <div className="pl-4 flex flex-col gap-2 mt-1 border-l border-white/20">

                {/* Our Approach nested */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link href="/what-we-do" className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>
                      Our Approach
                    </Link>
                    <button className="text-gray-400 hover:text-white px-2" onClick={() => setApproachOpen(!approachOpen)} aria-label="Expand approach">
                      <svg className={`w-4 h-4 transition-transform ${approachOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {approachOpen && (
                    <div className="pl-4 flex flex-col gap-1 mt-1 border-l border-white/10">
                      {ourApproachItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-gray-500 hover:text-white py-1 text-sm" onClick={closeMobile}>
                          <span className="text-[10px] text-gray-600 block">{item.sub}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thematic Areas nested */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link href="/thematic-areas" className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>
                      Thematic Areas
                    </Link>
                    <button className="text-gray-400 hover:text-white px-2" onClick={() => setThematicOpen(!thematicOpen)} aria-label="Expand thematic areas">
                      <svg className={`w-4 h-4 transition-transform ${thematicOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {thematicOpen && (
                    <div className="pl-4 flex flex-col gap-1 mt-1 border-l border-white/10">
                      {thematicAreas.map((area) => (
                        <Link key={area.href} href={area.href} className="text-gray-500 hover:text-white py-1 text-sm" onClick={closeMobile}>
                          {area.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/our-projects" className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>Our Projects</Link>
                <Link href="/resources" className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>Resources</Link>
              </div>
            )}
          </div>

          {/* Work With Us */}
          <div>
            <button className="flex items-center gap-1 text-gray-300 hover:text-white py-1 w-full text-left text-lg" onClick={() => setWorkWithUsOpen(!workWithUsOpen)}>
              Work With Us
              <svg className={`w-4 h-4 ml-1 transition-transform ${workWithUsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {workWithUsOpen && (
              <div className="pl-4 flex flex-col gap-2 mt-1 border-l border-white/20">
                {workWithUsItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white py-1 text-base" onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/contact" className="text-gray-300 hover:text-white py-1" onClick={closeMobile}>Get in Touch</Link>
        </nav>
      )}
    </header>
  );
}
