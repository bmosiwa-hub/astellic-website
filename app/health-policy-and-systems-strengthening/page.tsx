import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeUp, Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Health Policy & Systems Strengthening",
  description:
    "Astellic is a specialist African advisory firm for health policy, health systems strengthening, and evidence-to-delivery support.",
};

const capabilities = [
  {
    title: "Health Policy & Strategy",
    desc: "Policy analysis, strategy development, reform design, and evidence translation that help health-sector decisions move from intent to implementation.",
  },
  {
    title: "Health Systems Strengthening",
    desc: "Institutional diagnostics and practical support across governance, financing, workforce, service delivery, supply chains, and accountability.",
  },
  {
    title: "Primary Health Care & Service Delivery",
    desc: "Design and implementation support for integrated primary health care, community health systems, and equitable access to quality services.",
  },
  {
    title: "Health Financing",
    desc: "Financing diagnostics, resource-mobilisation analysis, costing, public financial management, and planning support for sustainable health services.",
  },
  {
    title: "Evidence, Learning & Data Systems",
    desc: "Research, evaluation, data-quality assurance, and learning systems designed around the decisions health institutions need to make.",
  },
  {
    title: "Embedded Technical Assistance",
    desc: "Senior, context-aware advisory support that stays close to the institutions responsible for delivering change.",
  },
];

export default function HealthPolicyAndSystemsStrengtheningPage() {
  return (
    <>
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/thematic-health.jpg"
          alt="Health professional in an African health-system setting"
          fill
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-brand-navy/80 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-5">
            Astellic&apos;s Specialist Focus
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            Health policy and systems strengthening.
          </h1>
          <p className="text-gray-200 text-xl max-w-2xl leading-relaxed">
            We help governments, donors, and health-sector partners turn evidence into policy,
            policy into implementation, and implementation into stronger health systems.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">What we do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              Advisory that understands how health systems work in practice.
            </h2>
            <div className="space-y-5 text-brand-muted text-lg leading-relaxed">
              <p>
                Astellic is a specialist African advisory firm focused exclusively on health policy and systems strengthening. Our work is grounded in the institutional realities that determine whether health reforms and programmes deliver for people.
              </p>
              <p>
                We combine rigorous evidence, policy analysis, and implementation experience to help clients make better decisions and strengthen the systems that carry those decisions into practice.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">Capabilities</p>
            <h2 className="text-3xl font-bold text-brand-navy mb-10">Where we add value</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.title} variant="up" delay={index * 70}>
                <div className="h-full bg-white rounded-xl border border-gray-100 p-7 shadow-sm">
                  <div className="w-8 h-1 bg-brand-gold rounded mb-4" />
                  <h3 className="text-xl font-bold text-brand-navy mb-3">{capability.title}</h3>
                  <p className="text-brand-muted leading-relaxed">{capability.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">Discuss a health-system challenge</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              If you are working to strengthen a health policy, programme, or institution, we would welcome a direct conversation about what will be useful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3 rounded transition-colors">
                Discuss an Engagement
              </Link>
              <Link href="/what-we-do" className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3 rounded transition-colors">
                Explore Our Services
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
