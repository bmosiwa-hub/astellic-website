import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Health & Nutrition Systems",
  description:
    "Astellic's work in health and nutrition systems — strengthening integrated service delivery, primary health care, and evidence-informed decision-making across Africa.",
};

const focusAreas = [
  {
    title: "Health Systems Strengthening",
    desc: "Supporting governments and institutions to build resilient, well-governed health systems that deliver quality care at scale — with a focus on financing, workforce, supply chains, and governance.",
  },
  {
    title: "Primary Health Care",
    desc: "Designing and implementing strategies that expand access to integrated primary health care services, with particular attention to community health systems and last-mile delivery.",
  },
  {
    title: "Nutrition Programming",
    desc: "Developing evidence-based nutrition interventions that address the full spectrum of malnutrition, linking health, agriculture, and social protection sectors.",
  },
  {
    title: "Evidence & Data Systems",
    desc: "Strengthening health information systems and supporting evidence-informed decision-making through data quality improvement, analytics, and research translation.",
  },
  {
    title: "Policy & Regulatory Support",
    desc: "Advising on health policy formulation, regulatory frameworks, and sector coordination to improve system performance and accountability.",
  },
];

export default function HealthPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/thematic-health.jpg"
          alt="African healthcare professional"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-semibold uppercase tracking-widest mb-3">Thematic Area 01</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Health &amp; Nutrition Systems
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Strengthening integrated systems that deliver equitable and effective
            health and nutrition services across Africa.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-5">
          Astellic works with governments, donors, the private sector, and
          implementing partners to strengthen the systems that underpin health
          and nutrition outcomes.
          Our approach recognises that sustainable improvements require
          action across governance, financing, service delivery, and community
          engagement — and that these elements must be addressed in an integrated,
          coherent way.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          We bring rigorous technical expertise to complex health system challenges,
          grounded in an understanding of how African institutions and communities
          actually function. Our work spans policy design, programme implementation,
          research, and capacity strengthening.
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
          <h2 className="text-2xl font-bold mb-4">Work with us on Health &amp; Nutrition</h2>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Whether you are a government ministry, donor agency, or implementing
            partner, Astellic can support your health and nutrition objectives
            with technical expertise and proven delivery.
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
