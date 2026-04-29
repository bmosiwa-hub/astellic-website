import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Astellic — our story, vision, and mission.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-about.jpg"
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
        <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-6">
          Astellic is a research, advisory, and implementation firm operating at
          the intersection of evidence, policy, and delivery. We work across
          Health &amp; Nutrition Systems; Governance &amp; Public Sector Reform;
          Education &amp; Social Services; and Climate, Agriculture &amp;
          Sustainability, partnering with governments, donors, and institutions
          across Africa to generate evidence, shape policy, and deliver
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
          organisations — evidence generation, policy design, programme
          development, implementation, and learning — into an integrated,
          coherent delivery system. Our approach is grounded in context,
          institutional reality, and technical rigour, ensuring that solutions
          are not only well-designed, but effectively implemented and sustained.
        </p>
      </section>

      {/* Vision & Mission */}
      <section className="bg-brand-light py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-10 h-1 bg-brand-teal mb-4 rounded" />
            <h2 className="text-xl font-bold mb-3">Vision</h2>
            <p className="text-brand-muted text-lg leading-relaxed">
              A world where systems consistently translate evidence into
              equitable, sustainable, and measurable outcomes.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-10 h-1 bg-brand-gold mb-4 rounded" />
            <h2 className="text-xl font-bold mb-3">Mission</h2>
            <p className="text-brand-muted text-lg leading-relaxed">
              To make policy implementable by integrating evidence, institutional
              realities, and delivery systems into practice.
            </p>
          </div>
        </div>
      </section>

      {/* The Gap */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">The Gap We Address</h2>
          <div className="border-l-4 border-brand-teal pl-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Not a scarcity of strategy</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                The development sector is not short of evidence, strategies,
                funding, or technical expertise. What is consistently scarce is
                the ability to translate them into results at scale.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">A failure to convert it into results</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                This is not a technical failure — it is a systems failure.
                Astellic was created to fill that gap through honest analysis,
                technically sound advice, and delivery aligned with clients&apos;
                genuine interests.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">The Astellic Premise</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                The implementation gap is not a technical problem. It is a
                systems problem. We address it as one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
