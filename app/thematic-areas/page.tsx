import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thematic Areas",
  description:
    "Astellic's four strategic domains: Health, Governance, Climate, and Education.",
};

const areas = [
  {
    num: "01",
    title: "Health & Nutrition Systems",
    desc: "Strengthening integrated systems that deliver equitable and effective services, with a focus on primary health care, service integration, and evidence-informed decision-making.",
    accent: "bg-brand-gold",
    image: "/images/thematic-health.jpg",
    imageAlt: "African healthcare professional",
    href: "/thematic-areas/health",
  },
  {
    num: "02",
    title: "Governance & Public Sector Reform",
    desc: "Improving how institutions design, implement, and deliver policy through enhanced accountability, legislative effectiveness, and institutional alignment.",
    accent: "bg-brand-navy",
    image: "/images/thematic-governance.jpg",
    imageAlt: "African government and public sector professionals",
    href: "/thematic-areas/governance",
  },
  {
    num: "03",
    title: "Climate, Agriculture & Sustainability",
    desc: "Supporting resilient systems that integrate climate policy, agricultural productivity, and sustainable resource management.",
    accent: "bg-brand-gold",
    image: "/images/thematic-climate.jpg",
    imageAlt: "African farmer working in the field",
    href: "/thematic-areas/climate",
  },
  {
    num: "04",
    title: "Human Development & Social Systems",
    desc: "Enhancing delivery systems for education, skills development, social protection, and human rights to improve equity and human capital outcomes.",
    accent: "bg-brand-navy",
    image: "/images/thematic-education.jpg",
    imageAlt: "African students learning",
    href: "/thematic-areas/education",
  },
];

export default function ThematicAreasPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="African professionals in a strategic meeting"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Where We Work
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic applies its integrated delivery model across four strategic
            areas — each representing a domain where the gap between policy
            intent and operational outcome demands a firm capable of bridging
            both.
          </p>
        </div>
      </section>


      {/* Areas */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {areas.map((a) => (
            <div
              key={a.num}
              className="bg-brand-light rounded-2xl overflow-hidden md:flex"
            >
              {/* Image */}
              <div className="relative w-full md:w-64 h-56 md:h-64 shrink-0">
                <Image
                  src={a.image}
                  alt={a.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 ${a.accent} opacity-40`} />
                <span className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                  {a.num}
                </span>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-3">{a.title}</h2>
                  <p className="text-brand-muted text-lg leading-relaxed">{a.desc}</p>
                </div>
                <div>
                  <Link
                    href={a.href}
                    className="inline-flex items-center gap-2 text-brand-gold font-semibold text-base hover:gap-3 transition-all"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Callout */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            A model built for complexity
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed">
            Across all four domains, Astellic brings the same commitment: honest
            analysis, technically sound advice, and delivery that is grounded in
            how African systems actually work.
          </p>
        </div>
      </section>
    </>
  );
}
