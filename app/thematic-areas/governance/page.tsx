import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Governance & Public Sector Reform",
  description:
    "Astellic's work in governance and public sector reform â€” improving how institutions design, implement, and deliver policy across Africa.",
};

const focusAreas = [
  {
    title: "Institutional Strengthening",
    desc: "Building the capacity of public institutions to design, coordinate, and deliver policy effectively, including organisational development, systems design, and change management.",
  },
  {
    title: "Legislative & Regulatory Effectiveness",
    desc: "Supporting parliaments, regulatory bodies, and oversight institutions to fulfil their mandates through improved processes, skills, and analytical capacity.",
  },
  {
    title: "Public Financial Management",
    desc: "Advising on budget planning, expenditure tracking, and financial accountability systems to improve the allocation and use of public resources.",
  },
  {
    title: "Decentralisation & Local Governance",
    desc: "Supporting the design and implementation of decentralisation reforms that strengthen local government capacity and improve service delivery at sub-national level.",
  },
  {
    title: "Accountability & Anti-Corruption",
    desc: "Developing and strengthening systems, institutions, and mechanisms that promote transparency, accountability, and integrity in public administration.",
  },
];

export default function GovernancePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/thematic-governance.jpg"
          alt="African government and public sector professionals"
          fill
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-3xl font-bold mb-4">Thematic Area 02</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Governance &amp; Public Sector Reform
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Improving how institutions design, implement, and deliver policy through
            enhanced accountability, legislative effectiveness, and institutional alignment.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-navy mb-6">Overview</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-5">
          Effective governance is foundational to development outcomes. Astellic
          works with governments, the private sector, legislatures, and oversight bodies to strengthen
          the institutions and systems through which policy is made and delivered.
          Our work addresses both the technical dimensions of governance (systems,
          processes, and tools) and the institutional dimensions: incentives,
          capacity, and political economy.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          We engage at national and sub-national levels, supporting reform
          processes that are realistic, context-sensitive, and designed for
          sustainability within African institutional realities.
        </p>
      </section>

      {/* Focus Areas */}
      <section className="bg-brand-light py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy mb-10">Our Focus Areas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {focusAreas.map((area, i) => (
              <Reveal key={area.title} variant="up" delay={i * 80}>
              <div className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm lift">
                <div className="w-1 h-6 bg-brand-navy rounded mb-4" />
                <h3 className="text-lg font-bold text-brand-navy mb-2">{area.title}</h3>
                <p className="text-brand-muted text-base leading-relaxed">{area.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Work with us on Governance &amp; Reform</h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-brand-muted text-lg mb-8 leading-relaxed">
              Astellic supports governments, the private sector, and development partners with technically
              sound, politically informed governance reform, from diagnostic through
              to implementation.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-lg transition-colors">
              Get in Touch
            </Link>
            <Link href="/thematic-areas" className="bg-brand-navy text-white hover:bg-brand-navy/90 px-8 py-3 rounded font-medium text-lg transition-colors">
              All Thematic Areas
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
