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
          Astellic is a research, advisory, and implementation firm operating at
          the intersection of evidence, policy, and delivery. We work across
          Health &amp; Nutrition Systems; Governance &amp; Public Sector Reform;
          Human Development &amp; Social Systems; and Climate, Agriculture &amp;
          Sustainability, partnering with governments, donors, the private sector,
          and institutions across Africa to generate evidence, shape policy, and deliver
          programmes that achieve measurable and sustained results.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          Across the development sector, strong policies and well-funded
          strategies often fail to deliver impact, not because of weak intent,
          but because of a breakdown between analysis, decision-making, and
          execution. Astellic was established to address this gap.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          We bring together capabilities that are typically fragmented across
          organisations, including evidence generation, policy design, programme
          development, implementation, and learning, into an integrated,
          coherent delivery system. Our approach is grounded in context,
          institutional reality, and technical rigour, ensuring that solutions
          are not only well-designed, but effectively implemented and sustained.
        </p>
      </section>
    </>
  );
}
