import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MemberEngagements from "@/components/MemberEngagements";
import { FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Previous Engagements by Astellic Members | Astellic",
  description:
    "Prior professional engagements completed by Astellic's members before the firm was founded. Presented by member, with institutional context and outcomes.",
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
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Member Experience
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Previous Engagements by Astellic Members
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            The professional track record each member brings to Astellic —
            organised by individual, with institutional context and outcomes
            for every engagement.
          </p>
        </div>
      </section>

      {/* Member engagements */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-1 h-8 bg-brand-gold rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Astellic Members</h2>
            </div>
            <p className="text-brand-muted text-sm ml-5 mb-10">
              Click a member to expand their prior engagements.
            </p>
          </FadeUp>

          <MemberEngagements />
        </div>
      </section>

      {/* Astellic's own portfolio — placeholder */}
      <section className="py-12 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-8 bg-brand-teal rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Astellic Engagements</h2>
            </div>
            <div className="border border-dashed border-gray-300 rounded-2xl py-14 text-center px-6">
              <p className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-3">Coming Soon</p>
              <p className="text-brand-navy font-semibold text-lg mb-2">
                Astellic is actively building its own engagement portfolio.
              </p>
              <p className="text-brand-muted text-sm max-w-xl mx-auto leading-relaxed">
                As engagements are completed under the Astellic banner they will appear here,
                clearly distinguished from member prior experience.
                If you would like to be among our first clients, we welcome the conversation.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
              >
                Start a Conversation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Capability callout */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1fr] gap-12">
          <SlideLeft>
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">
                Ready to Engage
              </p>
              <h2 className="text-2xl font-bold mb-5 leading-snug">
                The firm is new. The capabilities are not.
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                The experience above is the direct foundation of what Astellic offers today.
                Our members bring the same analytical rigour, methodological discipline,
                and institutional knowledge to every engagement — now through a firm
                built specifically to deliver it.
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
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Available Now</p>
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
