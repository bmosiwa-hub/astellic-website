import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Astellic | African Advisory & Evidence-to-Delivery Firm",
  description:
    "Astellic is a specialist African advisory firm helping governments, donors, and corporations close the gap between what evidence shows, what policy intends, and what systems deliver.",
};

const highlights = [
  { label: "Founded",     value: "2026" },
  { label: "Headquarters", value: "Lilongwe, Malawi" },
  { label: "Reach",       value: "Pan-African" },
  { label: "Model",       value: "Founder-led, specialist, senior-present" },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Astellic advisory environment"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            About Astellic
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            The firm that understands why systems fail.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic exists to close the gap between what evidence is showing,
            what policy intends, and what systems actually deliver.
          </p>
        </div>
      </section>

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-14 items-start">
          <div>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Who We Are</p>
            <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
              A specialist advisory firm. African-led. Evidence-driven. Practically useful.
            </h2>
            <div className="space-y-5 text-brand-muted text-lg leading-relaxed">
              <p>
                Astellic is a research, advisory, and implementation firm based in Lilongwe, Malawi.
                We work with governments, donors, development organisations, and corporations to help them
                generate rigorous evidence, translate it into implementable policy and strategy, and build
                the institutional conditions that allow well-designed development programmes and social
                investments to deliver sustained, measurable results.
              </p>
              <p>
                Our work combines analytical rigour, contextual intelligence, and operational realism.
                We bring together capabilities that are often fragmented across organisations — adaptive
                MERL, data quality and verification, implementation diagnostics, policy support, and
                learning systems — into a coherent, decision-focused approach grounded in how African
                systems actually work.
              </p>
              <p>
                Across the development sector, strong policies and well-funded programmes often fail to
                achieve sustained impact — not because of weak intent, but because of breakdowns between
                analysis, decision-making, and execution. The implementation gap is not a technical problem.
                It is a systems problem. We address it as one.
              </p>
            </div>
          </div>
          <div className="space-y-3 md:w-56">
            {highlights.map((h) => (
              <div key={h.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">{h.label}</p>
                <p className="font-semibold text-brand-navy text-sm">{h.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem Statement ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-5">
            The Problem We Solve
          </p>
          <blockquote className="text-2xl md:text-3xl font-bold leading-snug mb-8 max-w-3xl">
            "Across the development sector and corporate social investment landscape, well-funded
            strategies and credible commitments consistently fail to deliver measurable results —
            not because of weak intent, but because of a persistent breakdown between analysis,
            decision-making, and execution."
          </blockquote>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            The implementation gap is real. It is persistent. And it is largely caused by the
            fragmented way institutions commission research, advisory, and delivery as separate
            exercises. Astellic was built to address that fragmentation directly.
          </p>
        </div>
      </section>

      {/* ── Current Focus ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14">
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Current Focus</p>
              <h2 className="text-2xl font-bold text-brand-navy mb-5">
                Three Services. Exceptional Depth.
              </h2>
              <p className="text-brand-muted text-base leading-relaxed mb-6">
                Astellic is a specialist firm. We do three things with exceptional depth and
                a fourth for the private sector. We do not try to be everything to everyone —
                that focus is what makes our work reliable.
              </p>
              <div className="space-y-4">
                {[
                  { num: "01", title: "Adaptive MERL & Learning Systems",          color: "bg-brand-navy" },
                  { num: "02", title: "Data Quality, Verification & Research Integrity", color: "bg-brand-teal" },
                  { num: "03", title: "Policy-to-Implementation Systems Support",   color: "bg-brand-green" },
                  { num: "+",  title: "Corporate Advisory & Social Investment",      color: "bg-brand-gold" },
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-3">
                    <span className={`${s.color} text-white text-xs font-bold px-2 py-1 rounded shrink-0`}>{s.num}</span>
                    <p className="text-brand-navy text-sm font-medium">{s.title}</p>
                  </div>
                ))}
              </div>
              <Link href="/what-we-do" className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm mt-6 hover:gap-2.5 transition-all">
                Explore our services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Primary Domains</p>
              <h2 className="text-2xl font-bold text-brand-navy mb-5">
                Where We Currently Work
              </h2>
              <p className="text-brand-muted text-base leading-relaxed mb-6">
                Astellic&apos;s current work is focused primarily in Health &amp; Nutrition Systems
                and Governance &amp; Public Sector Reform, with selective engagements across Human
                Development, Social Systems, and Climate &amp; Sustainability through specialist
                partnerships and associate expertise.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Health & Nutrition Systems",          primary: true },
                  { label: "Governance & Public Sector Reform",   primary: true },
                  { label: "Human Development & Social Systems",  primary: false },
                  { label: "Climate, Agriculture & Sustainability", primary: false },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${d.primary ? "bg-brand-teal" : "bg-gray-300"} shrink-0`} />
                    <span className={`text-sm ${d.primary ? "text-brand-navy font-medium" : "text-brand-muted"}`}>
                      {d.label}
                      {d.primary && <span className="ml-2 text-xs text-brand-teal font-semibold">(Primary)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Navigation cards ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { title: "Vision & Mission",  href: "/about/vision-mission", desc: "The purpose that drives every engagement." },
              { title: "Our Team",          href: "/about/our-team",        desc: "Founder and leadership behind the work." },
              { title: "Why Astellic",      href: "/why-astellic",          desc: "What makes us different — and effective." },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-brand-navy mb-2 group-hover:text-brand-gold transition-colors">{card.title}</h3>
                <p className="text-brand-muted text-sm">{card.desc}</p>
                <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-xs mt-4 group-hover:gap-2 transition-all">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
