import Link from "next/link";
import Image from "next/image";

const highlights = [
  {
    label: "Research",
    desc: "Policy-relevant evidence grounded in context and institutional reality.",
  },
  {
    label: "Advisory",
    desc: "Actionable strategies that are technically credible and politically feasible.",
  },
  {
    label: "Implementation",
    desc: "Hands-on delivery with adaptive management that responds to real-world complexity.",
  },
];

const areas = [
  { title: "Health & Nutrition Systems", icon: "🏥" },
  { title: "Governance & Public Sector Reform", icon: "🏛️" },
  { title: "Climate, Agriculture & Sustainability", icon: "🌱" },
  { title: "Education & Social Services", icon: "📚" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-home.jpg"
          alt="African professionals in a policy meeting"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Working at the Intersection of Evidence, Policy and Delivery.
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto mb-10">
            Astellic partners with governments, donors, and institutions across
            Africa to translate evidence into policy priorities and programmes
            that produce measurable and sustainable results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-brand-teal hover:bg-brand-teal/90 text-white px-8 py-3 rounded font-medium text-base transition-colors"
            >
              Learn About Us
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 hover:border-white text-white px-8 py-3 rounded font-medium text-base transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What We Do</h2>
          <p className="text-center text-brand-muted text-lg max-w-2xl mx-auto mb-12">
            We integrate capabilities that are typically fragmented — evidence
            generation, policy design, programme development, and
            implementation — into a single, coherent delivery system.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((h) => (
              <div key={h.label} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-10 h-1 bg-brand-teal mb-4 rounded" />
                <h3 className="text-xl font-bold mb-3">{h.label}</h3>
                <p className="text-brand-muted text-base leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thematic areas teaser */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Domains of Expertise
          </h2>
          <p className="text-center text-brand-muted text-lg max-w-xl mx-auto mb-12">
            Astellic applies its integrated delivery model across four strategic
            areas where the gap between policy intent and operational outcome
            demands a firm capable of bridging both.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {areas.map((a) => (
              <div
                key={a.title}
                className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-3">{a.icon}</div>
                <p className="font-semibold text-base leading-snug">{a.title}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/thematic-areas"
              className="text-brand-teal font-medium hover:underline text-base"
            >
              Explore our thematic areas →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to close the implementation gap?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            We work with governments, donors, and institutions. Let&apos;s
            discuss how Astellic can support your priorities.
          </p>
          <Link
            href="/contact"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white px-10 py-3 rounded font-medium text-base transition-colors"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}
