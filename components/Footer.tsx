import Link from "next/link";

const services = [
  { label: "Research & Analytics",                       href: "/what-we-do/evidence/research-analytics" },
  { label: "Evaluation and Audit",                       href: "/what-we-do/evidence/evaluation-learning" },
  { label: "Policy & Strategy Analysis",                 href: "/what-we-do/policy/strategy-development" },
  { label: "Knowledge Translation & Advisory",           href: "/what-we-do/policy/knowledge-translation" },
  { label: "Programme Design & Readiness",               href: "/what-we-do/implementation/programme-design" },
  { label: "Implementation Support & Adaptive Mgmt",     href: "/what-we-do/implementation/adaptive-management" },
];

const about = [
  { label: "About Astellic",   href: "/about" },
  { label: "Vision & Mission",  href: "/about/vision-mission" },
  { label: "Our Team",          href: "/about/our-team" },
  { label: "Why Astellic",      href: "/why-astellic" },
  { label: "Our Approach",      href: "/approach" },
  { label: "Our Projects",      href: "/our-projects" },
];

const knowledge = [
  { label: "Insights & Thinking",      href: "/insights" },
  { label: "Implementation Briefs",    href: "/insights" },
  { label: "MERL Insights",            href: "/insights" },
  { label: "Policy Commentary",        href: "/insights" },
  { label: "Resources",                href: "/resources" },
];

const working = [
  { label: "Institutions We Support",  href: "/institutions-we-support" },
  { label: "Donors & Governments",     href: "/institutions-we-support/donors-and-governments" },
  { label: "Development Partners",     href: "/institutions-we-support/development-partners" },
  { label: "Corporate Institutions",   href: "/institutions-we-support/corporate-institutions" },
  { label: "Work With Us",             href: "/work-with-us" },
  { label: "Propose a Partnership",    href: "/propose-partnership" },
];

const domains = [
  "Health & Nutrition Systems",
  "Governance & Public Sector Reform",
  "Public Financial Management",
  "Education & Social Services",
  "Climate, Agriculture & Sustainability",
  "Corporate Social Investment",
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-400">

      {/* Institutional statement bar */}
      <div className="border-b border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-white font-semibold text-lg leading-snug max-w-2xl">
              &ldquo;Astellic exists to close the gap between what evidence is showing,
              what policy intends, and what systems actually deliver.&rdquo;
            </p>

          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-3 rounded text-sm transition-colors whitespace-nowrap"
          >
            Discuss an Engagement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <p className="text-white font-bold text-xl mb-1">Astellic</p>
            <p className="text-brand-gold text-xs uppercase tracking-[0.18em] font-semibold mb-5">
              Research · Advisory · Implementation
            </p>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              A specialist African advisory firm working at the intersection of evidence,
              policy, and delivery. We help governments, donors, and corporations close
              the gap between what evidence shows, what policy intends, and what systems deliver.
            </p>

            {/* Quick facts */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1 h-1 rounded-full bg-brand-gold shrink-0" />
                Lilongwe, Malawi
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1 h-1 rounded-full bg-brand-gold shrink-0" />
                Pan-African reach · 9+ countries
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1 h-1 rounded-full bg-brand-gold shrink-0" />
                Founder-led · Senior-present
              </div>
            </div>

            {/* Thematic domains */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Thematic Domains</p>
              <ul className="space-y-1.5">
                {domains.map((d) => (
                  <li key={d} className="text-xs text-gray-500 leading-snug">{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Services</p>
            <ul className="space-y-3">
              {services.map((l) => (
                <li key={l.href + l.label}>
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
                <li key={l.href + l.label}>
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
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Engage */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Engage</p>
            <ul className="space-y-3">
              {working.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Contact / Downloads / Connect row */}
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
            <p className="text-sm mb-4">Lilongwe, Malawi / Pan-African</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-brand-gold text-xs font-semibold hover:underline"
            >
              Send an enquiry →
            </Link>
          </div>

          {/* Downloads */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Downloads</p>
            <ul className="space-y-2.5">
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
              <li>
                <a href="/documents/Astellic_Capability_Statement.pdf" target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Capability Statement
                </a>
              </li>
            </ul>
          </div>

          {/* Connect + Newsletter */}
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Connect</p>
            <a
              href="https://www.linkedin.com/company/astellic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors mb-5"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>

            {/* Insights signup */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Insights Newsletter</p>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Receive implementation briefs and institutional intelligence — quarterly at most.
              </p>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 text-brand-gold text-xs font-semibold hover:underline"
              >
                Subscribe to Insights →
              </Link>
            </div>
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
            <Link href="/why-astellic" className="hover:text-white transition-colors">Why Astellic</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
