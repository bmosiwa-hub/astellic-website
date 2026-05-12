import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Astellic",
  description: "Learn about Astellic — who we are and what we do.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Astellic team in discussion"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Building the Future
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic exists to close the gap between what evidence is showing,
            what policy intends, and what systems actually deliver.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-gold mb-4">Who We Are</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          Astellic is an African research and advisory firm helping governments, donors,
          development partners, and the private sector learn continuously, trust their data,
          and make strategy work in practice.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          We operate at the intersection of evidence, policy, and delivery, supporting
          institutions to understand what their evidence is actually showing, strengthen
          the integrity of their data systems, and build the institutional conditions
          required for effective implementation.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          Across the development sector, strong policies and well-funded programmes often
          fail to achieve sustained impact, not because of weak intent, but because of
          breakdowns between analysis, decision-making, and execution. Astellic was
          established to help close that gap.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          Our work combines analytical rigour, contextual intelligence, and operational
          realism. We bring together capabilities that are often fragmented across
          organisations, including adaptive MERL, data quality and verification,
          implementation diagnostics, policy support, and learning systems, into a
          coherent, decision-focused approach grounded in how systems actually work.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          Astellic&apos;s current work is focused primarily in Health &amp; Nutrition Systems
          and Governance &amp; Public Sector Reform, with selective engagements in Human
          Development, Social Systems, and Climate &amp; Sustainability through specialist
          partnerships and associate expertise.
        </p>
      </section>
    </>
  );
}
