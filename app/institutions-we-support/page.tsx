import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Who We Work With | Astellic",
  description:
    "Astellic works with governments, bilateral and multilateral donors, NGOs and implementing partners, and private corporations to close the gap between evidence, policy, and delivery.",
};

const segments = [
  {
    title: "Governments & National Ministries",
    href: "/institutions-we-support/governments",
    accent: "bg-brand-gold",
    textAccent: "text-brand-gold",
    description:
      "Policy intent and delivery reality are rarely the same. We help governments close the implementation gap through political economy analysis, institutional diagnostics, and embedded advisory that stays until delivery works.",
    tags: ["Policy Advisory", "Implementation Readiness", "Political Economy", "Institutional Diagnostics"],
    icon: (
      <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
      </svg>
    ),
  },
  {
    title: "Bilateral & Multilateral Donors",
    href: "/institutions-we-support/bilateral-donors",
    accent: "bg-brand-navy",
    textAccent: "text-brand-navy",
    description:
      "We help donors strengthen implementation realism, evidence integrity, and adaptive learning across their portfolios, so what is funded and what is delivered actually align.",
    tags: ["Adaptive MERL", "Data Quality Assurance", "Implementation Realism", "Portfolio Strengthening"],
    icon: (
      <svg className="w-8 h-8 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "NGOs & Implementing Partners",
    href: "/institutions-we-support/ngos-and-partners",
    accent: "bg-brand-teal",
    textAccent: "text-brand-teal",
    description:
      "We help implementing organisations move beyond compliance-driven M&E and weak programme adaptation, building the systems and capacity that make delivery effective and credible.",
    tags: ["Adaptive Learning", "Programme Design", "Capacity Development", "Evidence Translation"],
    icon: (
      <svg className="w-8 h-8 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Private Corporations",
    href: "/institutions-we-support/corporations",
    accent: "bg-brand-green",
    textAccent: "text-brand-green",
    description:
      "We help corporations build credible, evidence-driven social investment and ESG systems that withstand scrutiny, satisfy institutional investors, and produce outcomes worth reporting.",
    tags: ["ESG Systems", "Social Impact Evaluation", "Governance Frameworks", "Investment Strategy"],
    icon: (
      <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
];

export default function InstitutionsWeSupport() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Who We Work With — Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-sm font-semibold tracking-widest uppercase mb-4">
            Institutions We Support
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Who We Work With
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Whether you fund, design, or deliver development outcomes, Astellic has a precise
            entry point for your institution. We work across the full results chain.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-5">
            One Integrated Approach. Four Distinct Partnerships.
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mx-auto">
            The implementation gap looks different depending on where you sit in the development system.
            Funders face evidence and accountability failures. Governments face delivery and coordination failures.
            Implementing partners face learning and adaptation failures. Corporations face governance and
            credibility failures. Astellic brings the same rigour and contextual intelligence to each relationship,
            tailored to what each institution actually needs to close its gap.
          </p>
        </div>
      </section>

      {/* Segment cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {segments.map((seg) => (
              <Link
                key={seg.href}
                href={seg.href}
                className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col gap-5"
              >
                <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center">
                  {seg.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-gold transition-colors">
                    {seg.title}
                  </h3>
                  <p className="text-brand-muted text-base leading-relaxed mb-5">
                    {seg.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seg.tags.map((tag) => (
                      <span key={tag} className="text-xs font-medium bg-brand-light text-brand-navy px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brand-gold font-semibold text-sm group-hover:gap-3 transition-all">
                  Explore this partnership
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Not Sure Where You Fit?</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Many of our engagements span multiple institution types. Tell us what you are working on
            and we will identify the right entry point.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Start a Conversation
            </Link>
            <Link
              href="/what-we-do/evidence"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              See Our Approach
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
