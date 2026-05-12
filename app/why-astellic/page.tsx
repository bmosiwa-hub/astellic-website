import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Astellic",
  description:
    "What makes Astellic different — four pillars of distinctive value.",
};

const pillars = [
  {
    label: "Pillar I",
    title: "Bridging Policy and Implementation",
    desc: "We design policy with implementation in mind and deliver programmes anchored in strategic intent.",
  },
  {
    label: "Pillar II",
    title: "Integrated, End-to-End Delivery",
    desc: "We provide coherent support across the full results chain, eliminating fragmentation and coordination gaps.",
  },
  {
    label: "Pillar III",
    title: "Adaptive & Systems-Oriented",
    desc: "We apply learning-driven delivery that strengthens systems while responding to real-world complexity.",
  },
  {
    label: "Pillar IV",
    title: "Context-Driven & Politically Informed",
    desc: "Our work is grounded in institutional realities, power dynamics, and incentive structures that shape what is feasible.",
  },
];

const facts = [
  { label: "Sector", value: "Research, Advisory & Implementation" },
  { label: "Geography", value: "Africa-focused" },
  { label: "Clients", value: "Donors, Governments, Institutions" },
  { label: "Approach", value: "Evidence, Policy, Delivery" },
  { label: "Est.", value: "Malawi / Pan-African" },
];

export default function WhyAstellicPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-why.jpg"
          alt="African business leaders in discussion"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            We are not just different. We are effective.
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            Our core value lies in a distinctive combination: the analytical
            depth of a policy research firm, the practical rigour of an
            implementation partner, and the contextual intelligence of an
            organisation that understands how African systems actually work.
          </p>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-gold mb-6">Our Positioning</h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            We are not:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="font-semibold mb-1">A research firm that stops at analysis</p>
              <p className="text-brand-muted text-base">
                We go beyond generating evidence — we ensure it shapes policy
                and gets implemented.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="font-semibold mb-1">
                An implementation partner without analytical depth
              </p>
              <p className="text-brand-muted text-base">
                Every programme we deliver is grounded in rigorous analysis and
                sound strategy.
              </p>
            </div>
          </div>
          <p className="text-brand-navy font-medium">
            We are deliberately positioned at the intersection — because that is
            where real results are produced.
          </p>
        </div>
      </section>

      {/* Four pillars */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-gold text-center mb-12">
            What Makes Astellic Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((p) => (
              <div key={p.label} className="bg-brand-light rounded-xl p-8">
                <p className="text-brand-teal text-base font-bold uppercase tracking-widest mb-2">
                  {p.label}
                </p>
                <h3 className="text-lg font-bold text-brand-navy mb-3">{p.title}</h3>
                <p className="text-brand-muted text-base leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* At a glance */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Astellic at a Glance
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {facts.map((f) => (
              <div key={f.label} className="bg-white/5 rounded-xl p-6">
                <p className="text-brand-gold text-base uppercase tracking-widest mb-1">
                  {f.label}
                </p>
                <p className="font-semibold">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-10 py-3 rounded font-medium transition-colors"
            >
              Connect with Astellic
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
