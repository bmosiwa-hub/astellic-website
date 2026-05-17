"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import SearchModal from "@/components/SearchModal";

const institutionsItems = [
  { label: "Donors & Governments",    href: "/institutions-we-support/donors-and-governments",  dot: "bg-brand-gold" },
  { label: "Corporate Institutions",  href: "/institutions-we-support/corporate-institutions",   dot: "bg-brand-navy" },
  { label: "Development Partners",    href: "/institutions-we-support/development-partners",     dot: "bg-brand-teal" },
];

const thematicAreas = [
  { label: "Health & Nutrition Systems",              href: "/thematic-areas/health"      },
  { label: "Governance & Public Sector Reform",       href: "/thematic-areas/governance"  },
  { label: "Climate, Agriculture & Sustainability",   href: "/thematic-areas/climate"     },
  { label: "Human Development & Social Systems",      href: "/thematic-areas/education"   },
];

const ourApproachItems = [
  { label: "Evidence Generation & Verification",               sub: "Pillar 01", href: "/what-we-do/evidence",        dot: "bg-brand-navy"  },
  { label: "Policy Development & Advisory",                    sub: "Pillar 02", href: "/what-we-do/policy",          dot: "bg-brand-teal"  },
  { label: "Policy, Systems Analysis & Implementation",         sub: "Pillar 03", href: "/what-we-do/implementation",  dot: "bg-brand-green" },
];

const workWithUsItems = [
  { label: "Check Openings",        href: "/work-with-us"         },
  { label: "Propose Partnership",   href: "/propose-partnership"  },
  { label: "Join Our Roster",       href: "/join-our-roster"      },
];

const whoWeAreItems = [
  { label: "About Astellic",        href: "/about"               },
  { label: "Vision & Mission",      href: "/about/vision-mission" },
  { label: "Our Team",              href: "/about/our-team"       },
  { label: "Astellic Social Impact Lab (ASIL)", href: "/asil"    },
];

/* ── Simple flat dropdown ── */
function FlatDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  return (
    <div className="relative group hidden md:block">
      <button
        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium"
        aria-haspopup="true"
      >
        {label}
        <svg className="w-3.5 h-3.5 mt-0.5 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50">
        <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[220px] border border-gray-100">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-3 text-brand-navy text-sm font-medium hover:bg-brand-light hover:text-brand-gold transition-colors"
            >
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
      <button
        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium"
        aria-haspopup="true"
      >
        Our Work
        <svg className="w-3.5 h-3.5 mt-0.5 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50">
        <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[240px] border border-gray-100">

          {/* Institutions We Support — nested flyout */}
          <div className="relative group/institutions">
            <div className="flex items-center justify-between px-5 py-3 hover:bg-brand-light cursor-pointer">
              <Link href="/institutions-we-support" className="text-brand-navy text-sm font-medium hover:text-brand-gold transition-colors flex-1">
                Institutions We Support
              </Link>
              <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="absolute left-full top-0 pl-1 hidden group-hover/institutions:block z-50">
              <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[260px] border border-gray-100">
                <p className="px-5 pt-2 pb-1 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Who We Work With</p>
                {institutionsItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-light transition-colors group/item">
                    <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                    <p className="text-sm font-medium text-brand-navy group-hover/item:text-brand-gold transition-colors">{item.label}</p>
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link href="/institutions-we-support" className="block px-5 py-2.5 text-brand-gold text-sm font-semibold hover:bg-brand-light transition-colors">
                    View all institutions →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Our Approach — nested flyout with pillars */}
          <div className="relative group/approach">
            <div className="flex items-center justify-between px-5 py-3 hover:bg-brand-light cursor-pointer">
              <Link href="/what-we-do" className="text-brand-navy text-sm font-medium hover:text-brand-gold transition-colors flex-1">
                Our Approach
              </Link>
              <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="absolute left-full top-0 pl-1 hidden group-hover/approach:block z-50">
              <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[290px] border border-gray-100">
                <p className="px-5 pt-2 pb-1 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Three Pillars</p>
                {ourApproachItems.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-start gap-3 px-5 py-3 hover:bg-brand-light transition-colors group/item">
                    <span className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-brand-muted">{item.sub}</p>
                      <p className="text-sm font-medium text-brand-navy group-hover/item:text-brand-gold transition-colors leading-snug">{item.label}</p>
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
              <Link href="/thematic-areas" className="text-brand-navy text-sm font-medium hover:text-brand-gold transition-colors flex-1">
                Thematic Areas
              </Link>
              <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="absolute left-full top-0 pl-1 hidden group-hover/thematic:block z-50">
              <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[280px] border border-gray-100">
                {thematicAreas.map((area) => (
                  <Link key={area.href} href={area.href} className="block px-5 py-3 text-brand-navy text-sm font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
                    {area.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/our-projects" className="block px-5 py-3 text-brand-navy text-sm font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
            Our Projects
          </Link>
          <Link href="/resources" className="block px-5 py-3 text-brand-navy text-sm font-medium hover:bg-brand-light hover:text-brand-gold transition-colors">
            Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [whoWeAreOpen,   setWhoWeAreOpen]   = useState(false);
  const [ourWorkOpen,    setOurWorkOpen]     = useState(false);
  const [institutionsOpen, setInstitutionsOpen] = useState(false);
  const [approachOpen,   setApproachOpen]   = useState(false);
  const [thematicOpen,   setThematicOpen]   = useState(false);
  const [workWithUsOpen, setWorkWithUsOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Global ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setWhoWeAreOpen(false);
    setOurWorkOpen(false);
    setInstitutionsOpen(false);
    setApproachOpen(false);
    setThematicOpen(false);
    setWorkWithUsOpen(false);
  };

  return (
    <header
      className={`bg-brand-navy text-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-[0_4px_32px_rgba(0,0,0,0.45)]" : ""
      }`}
    >
      {/* ── Top bar: scrolled indicator strip ── */}
      <div
        className={`h-0.5 bg-brand-gold transition-all duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
        style={{ width: "100%" }}
      />

      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Astellic"
            width={160}
            height={52}
            className="object-contain h-12 w-auto"
            priority
          />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Home — gold, always visible anchor */}
          <Link
            href="/"
            className="text-brand-gold font-semibold text-sm hover:text-brand-gold/80 transition-colors relative group"
          >
            Home
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-gold group-hover:w-full transition-all duration-200 rounded" />
          </Link>

          <FlatDropdown label="Who We Are" items={whoWeAreItems} />

          <Link
            href="/why-astellic"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Why Astellic
          </Link>

          <OurWorkDropdown />

          <Link
            href="/insights"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Insights
          </Link>

          <FlatDropdown label="Work With Us" items={workWithUsItems} />

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search site (Ctrl+K)"
            className="flex items-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-all duration-200 group"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
            </svg>
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors hidden lg:inline">
              Search
            </span>
            <kbd className="hidden lg:inline-flex text-[10px] font-mono text-gray-600 group-hover:text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 transition-colors">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/contact"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand-gold/25"
          >
            Get in Touch
          </Link>
        </nav>

        {/* Mobile search icon */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
          </svg>
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 flex flex-col gap-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <nav className="md:hidden bg-brand-navy border-t border-white/10 px-6 pb-6 pt-2 flex flex-col gap-0.5">

          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-brand-gold font-bold py-3 border-b border-white/10"
            onClick={closeMobile}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Home
          </Link>

          {/* Who We Are */}
          <div className="border-b border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white text-sm font-medium"
              onClick={() => setWhoWeAreOpen(!whoWeAreOpen)}
            >
              Who We Are
              <svg className={`w-4 h-4 transition-transform ${whoWeAreOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {whoWeAreOpen && (
              <div className="pl-4 pb-2 flex flex-col gap-1 border-l border-white/20">
                {whoWeAreItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/why-astellic" className="py-3 text-gray-300 hover:text-white text-sm font-medium border-b border-white/10" onClick={closeMobile}>
            Why Astellic
          </Link>

          {/* Our Work */}
          <div className="border-b border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white text-sm font-medium"
              onClick={() => setOurWorkOpen(!ourWorkOpen)}
            >
              Our Work
              <svg className={`w-4 h-4 transition-transform ${ourWorkOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {ourWorkOpen && (
              <div className="pl-4 pb-2 flex flex-col gap-1 border-l border-white/20">
                {/* Institutions */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link href="/institutions-we-support" className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>
                      Institutions We Support
                    </Link>
                    <button className="px-2 text-gray-400 hover:text-white" onClick={() => setInstitutionsOpen(!institutionsOpen)}>
                      <svg className={`w-3.5 h-3.5 transition-transform ${institutionsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {institutionsOpen && (
                    <div className="pl-4 flex flex-col gap-1 border-l border-white/10">
                      {institutionsItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-gray-500 hover:text-white py-1 text-xs" onClick={closeMobile}>{item.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
                {/* Our Approach */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link href="/what-we-do" className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>
                      Our Approach
                    </Link>
                    <button className="px-2 text-gray-400 hover:text-white" onClick={() => setApproachOpen(!approachOpen)}>
                      <svg className={`w-3.5 h-3.5 transition-transform ${approachOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {approachOpen && (
                    <div className="pl-4 flex flex-col gap-1 border-l border-white/10">
                      {ourApproachItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-gray-500 hover:text-white py-1 text-xs" onClick={closeMobile}>
                          <span className="text-[10px] text-gray-600 block">{item.sub}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {/* Thematic Areas */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link href="/thematic-areas" className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>
                      Thematic Areas
                    </Link>
                    <button className="px-2 text-gray-400 hover:text-white" onClick={() => setThematicOpen(!thematicOpen)}>
                      <svg className={`w-3.5 h-3.5 transition-transform ${thematicOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {thematicOpen && (
                    <div className="pl-4 flex flex-col gap-1 border-l border-white/10">
                      {thematicAreas.map((area) => (
                        <Link key={area.href} href={area.href} className="text-gray-500 hover:text-white py-1 text-xs" onClick={closeMobile}>{area.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link href="/our-projects" className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>Our Projects</Link>
                <Link href="/resources" className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>Resources</Link>
              </div>
            )}
          </div>

          <Link href="/insights" className="py-3 text-gray-300 hover:text-white text-sm font-medium border-b border-white/10" onClick={closeMobile}>
            Insights
          </Link>

          {/* Work With Us */}
          <div className="border-b border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white text-sm font-medium"
              onClick={() => setWorkWithUsOpen(!workWithUsOpen)}
            >
              Work With Us
              <svg className={`w-4 h-4 transition-transform ${workWithUsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {workWithUsOpen && (
              <div className="pl-4 pb-2 flex flex-col gap-1 border-l border-white/20">
                {workWithUsItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white py-1.5 text-sm" onClick={closeMobile}>{item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile search shortcut */}
          <button
            className="mt-3 flex items-center gap-3 w-full border border-white/15 rounded-lg px-4 py-3 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
            onClick={() => { closeMobile(); setSearchOpen(true); }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
            </svg>
            <span className="text-sm">Search the site…</span>
          </button>

          <Link
            href="/contact"
            className="mt-2 bg-brand-gold text-white font-semibold py-3 px-5 rounded text-sm text-center"
            onClick={closeMobile}
          >
            Get in Touch
          </Link>
        </nav>
      )}

      {/* Search modal — rendered inside header so it inherits the client boundary */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
