import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Climate, Agriculture & Sustainability",
  description:
    "Astellic's work in climate, agriculture and sustainability — supporting resilient systems that integrate climate policy, agricultural productivity, and sustainable resource management.",
};

const focusAreas = [
  {
    title: "Climate Policy & Adaptation",
    desc: "Supporting governments to develop, cost, and implement climate adaptation strategies and nationally determined contributions (NDCs) that are grounded in evidence and aligned with national development plans.",
  },
  {
    title: "Agricultural Systems & Value Chains",
    desc: "Strengthening agricultural systems through improved extension services, value chain development, market access, and smallholder productivity — with a focus on food security and rural livelihoods.",
  },
  {
    title: "Natural Resource Management",
    desc: "Advising on the governance and management of land, water, and forest resources to support sustainable use, reduce environmental degradation, and maintain ecosystem services.",
  },
  {
    title: "Climate Finance & Investment",
    desc: "Supporting access to and effective use of climate finance — including green bonds, climate funds, and blended finance mechanisms — to mobilise investment in resilient infrastructure and sustainable agriculture.",
  },
  {
    title: "Disaster Risk Reduction",
    desc: "Integrating disaster risk reduction into planning and programming to build community and system resilience to climate-related shocks, including droughts, floods, and food crises.",
  },
];

export default function ClimatePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/thematic-climate.jpg"
          alt="African farmer working in the field"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <Link href="/thematic-areas" className="inline-flex items-center gap-2 text-brand-gold text-base mb-6 hover:gap-3 transition-all">
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            All Thematic Areas
          </Link>
          <p className="text-brand-gold text-base font-semibold uppercase tracking-widest mb-3">Thematic Area 03</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Climate, Agriculture &amp; Sustainability
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Supporting resilient systems that integrate climate policy, agricultural
            productivity, and sustainable resource management.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-5">
          Africa faces acute and accelerating climate risks — from erratic rainfall
          and prolonged droughts to flooding and land degradation — that directly
          threaten agricultural productivity, food security, and livelihoods.
          Astellic works at the intersection of climate, agriculture, and
          sustainability to help governments and institutions build systems that
          are resilient, productive, and environmentally sound.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          Our approach integrates policy, technical, and implementation expertise
          to ensure that climate and agricultural strategies translate into
          practical outcomes on the ground — for communities, smallholders, and
          ecosystems alike.
        </p>
      </section>

      {/* Focus Areas */}
      <section className="bg-brand-light py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-10">Our Focus Areas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {focusAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm">
                <div className="w-1 h-6 bg-brand-gold rounded mb-4" />
                <h3 className="text-lg font-bold text-brand-navy mb-2">{area.title}</h3>
                <p className="text-brand-muted text-base leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Work with us on Climate &amp; Agriculture</h2>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Astellic combines climate science, agricultural expertise, and
            implementation know-how to support governments and partners in
            building a more resilient and sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-lg transition-colors">
              Get in Touch
            </Link>
            <Link href="/thematic-areas" className="border border-brand-navy text-brand-navy hover:bg-brand-light px-8 py-3 rounded font-medium text-lg transition-colors">
              All Thematic Areas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
