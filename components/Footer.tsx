import Link from "next/link";

const services = [
  { label: "Adaptive MERL & Learning Systems",    href: "/what-we-do/evidence/evaluation-learning" },
  { label: "Data Quality & Verification",          href: "/what-we-do/evidence/data-quality" },
  { label: "Policy-to-Implementation Support",     href: "/what-we-do/implementation" },
  { label: "Corporate Advisory & CSI",             href: "/institutions-we-support/corporate-institutions" },
  { label: "Full Delivery Architecture",           href: "/what-we-do" },
];

const about = [
  { label: "About Astellic",          href: "/about" },
  { label: "Vision & Mission",         href: "/about/vision-mission" },
  { label: "Our Team",                 href: "/about/our-team" },
  { label: "Why Astellic",             href: "/why-astellic" },
  { label: "Our Approach",             href: "/approach" },
];

const knowledge = [
  { label: "Insights & Thinking",      href: "/insights" },
  { label: "Implementation Briefs",    href: "/insights" },
  { label: "MERL Insights",            href: "/insights" },
  { label: "Resources",                href: "/resources" },
  { label: "Our Projects",             href: "/our-projects" },
];

const working = [
  { label: "Institutions We Support",  href: "/institutions-we-support" },
  { label: "Donors & Governments",     href: "/institutions-we-support/donors-and-governments" },
  { label: "Development Partners",     href: "/institutions-we-support/development-partners" },
  { label: "Work With Us",             href: "/work-with-us" },
  { label: "Propose a Partnership",    href: "/propose-partnership" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-400">

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <p className="text-white font-bold text-xl mb-1">Astellic</p>
            <p className="text-brand-gold text-xs uppercase tracking-[0.18em] font-semibold mb-5">
              Research · Advisory · Implementation
            </p>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              A specialist African advisory firm. We help governments, donors, and corporations
              close the gap between what evidence shows, what policy intends, and what systems deliver.
            </p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Based in
            </p>
            <p className="text-sm text-gray-400">Lilongwe, Malawi</p>
            <p className="text-sm text-gray-500">Pan-African reach</p>
          </div>

          {/* Services */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Services</p>
            <ul className="space-y-3">
              {services.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors leading-snug block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">About</p>
            <ul className="space-y-3">
              {about.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Knowledge */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Knowledge</p>
            <ul className="space-y-3">
              {knowledge.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working together */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Engage</p>
            <ul className="space-y-3">
              {working.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Contact row */}
        <div className="border-t border-white/10 mt-12 pt-10 grid md:grid-cols-3 gap-8">

          {/* Contact */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Contact</p>
            <a
              href="mailto:partnerships@astellic.com"
              className="text-sm hover:text-white transition-colors block mb-1"
            >
              partnerships@astellic.com
            </a>
            <p className="text-sm">Lilongwe, Malawi / Pan-African</p>
          </div>

          {/* Downloads */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Downloads</p>
            <ul className="space-y-2">
              <li>
                <a href="/documents/Astellic_EOI_Consultants_Roster.pdf" target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Consultants Roster EOI
                </a>
              </li>
              <li>
                <Link href="/resources" className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  All Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & tagline */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Connect</p>
            <a
              href="https://www.linkedin.com/company/astellic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
            <p className="text-xs text-gray-600 mt-5 leading-relaxed max-w-xs">
              "Astellic exists to close the gap between what evidence is showing,
              what policy intends, and what systems actually deliver."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Astellic. All rights reserved. Lilongwe, Malawi.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
