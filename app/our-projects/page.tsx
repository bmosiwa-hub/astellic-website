import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MemberEngagements from "@/components/MemberEngagements";
import { FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Work done by Astellic and its Members | Astellic",
  description:
    "Projects and engagements completed by Astellic and by its members prior to the firm's founding, presented with institutional context and outcomes.",
};

const availableNow = [
  "Adaptive MERL system design for donor-funded programmes",
  "Independent data quality audits (DQA) for government programmes",
  "Implementation readiness reviews before programme launch",
  "Political economy analysis for reform strategy",
  "Independent programme evaluation (formative, summative, impact)",
  "Corporate social investment strategy and measurement",
];

export default function OurProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic members' prior work"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-5">
            Our Work
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Work done by Astellic and its Members
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Projects delivered by Astellic, and prior professional engagements brought to the firm by its members, presented by individual, with institutional context and outcomes.
          </p>
        </div>
      </section>

      {/* Member engagements */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-1 h-8 bg-brand-gold rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Prior Work by Astellic Members</h2>
            </div>
            <p className="text-brand-muted text-sm ml-5 mb-10">
              Professional engagements completed by Astellic&apos;s members before the firm was founded. Click to expand.
            </p>
          </FadeUp>

          <MemberEngagements />
        </div>
      </section>

      {/* Astellic Projects */}
      <section className="py-16 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-8 bg-brand-teal rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Astellic Projects</h2>
            </div>
            <p className="text-brand-muted text-sm ml-5 mb-10">
              Projects initiated and delivered under the Astellic banner.
            </p>
          </FadeUp>

          <div className="space-y-6">
            {/* ASIL Pilot 001 */}
            <FadeUp>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-brand-navy px-7 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">ASIL · Pilot 001</span>
                    <span className="bg-brand-gold text-white text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Active</span>
                  </div>
                  <span className="text-gray-500 text-xs">June 2026 – May 2027</span>
                </div>
                <div className="p-7 grid md:grid-cols-[1fr_200px] gap-8 items-start">
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy mb-2 leading-snug">
                      Clean Cooking and Women&apos;s Health: A Community Governance and Adaptive Accountability Pilot
                    </h3>
                    <p className="text-brand-muted text-sm leading-relaxed mb-4">
                      ASIL&apos;s inaugural implementation learning pilot. Improved cookstoves are a well-evidenced women&apos;s health intervention that consistently fails at scale — because sustained adoption beyond the sponsored project period rarely materialises. This pilot uses clean cooking as a live case study in the central ASIL implementation question: what governance architecture makes a known-good intervention durable? Operating across three Malawian communities, the pilot tests a Community Accountability Committee with an explicit equity mandate alongside a Women&apos;s Health Evidence System over a 12-month adaptive governance cycle.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Health", "Environmental Sustainability", "Gender"].map((tag) => (
                        <span key={tag} className="text-xs font-medium bg-brand-light border border-gray-200 text-brand-muted px-3 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/asil/pilots/asil-p001"
                      className="flex items-center justify-between bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl px-5 py-3.5 group transition-colors"
                    >
                      <span className="text-sm font-semibold">View Full Details</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/asil"
                      className="flex items-center justify-between bg-brand-light border border-gray-100 hover:border-brand-gold text-brand-navy rounded-xl px-5 py-3.5 group transition-colors"
                    >
                      <span className="text-sm font-semibold">About ASIL</span>
                      <svg className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="bg-brand-light rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Expected Output</p>
                      <p className="text-brand-navy text-xs font-medium">ASIL Learning Report 001, Q2 2027</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Capability callout */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1fr] gap-12">
          <SlideLeft>
            <div>
              <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-4">
                Engage with Astellic
              </p>
              <h2 className="text-2xl font-bold mb-5 leading-snug">
                Building a practice-grounded evidence base.
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                Astellic is actively building a portfolio of implementation pilots, advisory assignments, and documented evidence from real operational conditions. The experience our members bring is the direct foundation; and Astellic&apos;s own work is accumulating alongside it.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
              >
                Discuss an Engagement
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SlideLeft>
          <SlideRight>
            <div>
              <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">Available Now</p>
              <ul className="space-y-3">
                {availableNow.map((cap) => (
                  <li key={cap} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </SlideRight>
        </div>
      </section>
    </>
  );
}
