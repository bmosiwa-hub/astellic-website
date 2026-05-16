import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Corporate Advisory & Social Investment | Astellic",
  description:
    "Astellic helps corporations in Malawi and across Africa design evidence-based social investment strategies, build credible ESG systems, and measure impact with the rigour that governance and institutional investors demand.",
};

const problems = [
  {
    issue: "Weak investment design",
    detail: "Most CSI programmes fund activities, not outcomes. Without a theory of change, results framework, or implementation readiness assessment, even well-intentioned investment produces unmeasurable or marginal impact.",
  },
  {
    issue: "No credible measurement",
    detail: "Anecdotal evidence and output counts do not constitute impact evidence. Institutional investors, regulators, and informed stakeholders expect measurement frameworks that can withstand scrutiny.",
  },
  {
    issue: "Poor governance of social spend",
    detail: "Social investment decisions are rarely governed with the same discipline as core business. Accountability structures, learning systems, and adaptive management are typically absent.",
  },
  {
    issue: "Disconnected from business strategy",
    detail: "CSI treated as a separate obligation produces compliance-grade outputs. Aligned social investment — connected to operating environment, supply chain, and community licence to operate — produces strategic value.",
  },
];

const services = [
  {
    num: "01",
    title: "Social Investment Strategy & Design",
    desc: "We design social investment programmes that are strategically aligned, evidentially grounded, and built for accountability. This means a theory of change, clear results frameworks, governance structures, and implementation readiness — not a brochure.",
    engagements: ["Community investment strategy", "CSI programme design", "Theory of change development", "Results framework & KPIs", "Implementation readiness review"],
    cta: "Request a CSI Strategy Review",
    color: "border-brand-navy",
    numBg: "bg-brand-navy",
  },
  {
    num: "02",
    title: "ESG Systems & Reporting Frameworks",
    desc: "We help companies build ESG frameworks that reflect institutional reality — aligned to international standards (GRI, SASB, B-Team Responsible Business), adapted to African operating contexts, and structured to produce credible disclosure rather than curated narrative.",
    engagements: ["ESG materiality assessment", "Reporting framework design", "Baseline data systems", "International standards alignment", "ESG governance advisory"],
    cta: "Discuss ESG Advisory",
    color: "border-brand-teal",
    numBg: "bg-brand-teal",
  },
  {
    num: "03",
    title: "Social Impact Measurement & Evaluation",
    desc: "We design and operate impact measurement systems that produce defensible evidence — the kind that holds up to independent scrutiny from NGO critics, regulatory bodies, and institutional investors. We also conduct independent evaluations of existing CSI portfolios.",
    engagements: ["Impact measurement system design", "Independent CSI evaluation", "Data collection & analysis", "Beneficiary outcome tracking", "Portfolio performance review"],
    cta: "Request an Impact Evaluation",
    color: "border-brand-green",
    numBg: "bg-brand-green",
  },
  {
    num: "04",
    title: "Stakeholder Engagement & Social Risk",
    desc: "We design meaningful stakeholder engagement processes, conduct social risk assessments, and develop community relations frameworks grounded in political economy analysis — reducing operational risk and building the social licence to operate.",
    engagements: ["Social risk assessment", "Stakeholder mapping & engagement", "Community relations strategy", "Political economy analysis", "Grievance mechanism design"],
    cta: "Discuss Social Risk Advisory",
    color: "border-brand-gold",
    numBg: "bg-brand-gold",
  },
];

const clientTypes = [
  { label: "Listed Companies",        desc: "Corporations with ESG disclosure obligations to stock exchanges and institutional investors" },
  { label: "Financial Institutions",  desc: "Commercial banks, investment funds, and insurers aligning portfolios with sustainability frameworks" },
  { label: "Corporate Foundations",   desc: "Company-sponsored foundations managing structured social investment programmes" },
  { label: "Extractive Industries",   desc: "Mining, oil & gas, and agribusiness companies managing community and environmental impacts" },
  { label: "Manufacturers & Exporters", desc: "Companies meeting sustainability requirements from international buyers and supply chain auditors" },
  { label: "Family-Owned Enterprises", desc: "Large privately-held businesses building long-term ESG and community investment frameworks" },
];

export default function CorporateInstitutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Corporate Advisory — Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Corporate Advisory & Social Investment
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Most corporate social investment programmes are not designed to produce evidence.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed mb-8">
            Astellic helps corporations move from compliance-grade social obligation to
            evidence-based investment — with the governance, measurement, and learning
            systems that institutional credibility demands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3.5 rounded font-semibold text-sm transition-colors"
            >
              Request a CSI Systems Review
            </Link>
            <Link
              href="#services"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3.5 rounded font-semibold text-sm transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem — stripped down, direct */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-5">The Problem</p>
            <h2 className="text-3xl font-bold text-brand-navy mb-4 max-w-2xl leading-snug">
              Why most CSI programmes cannot demonstrate the impact they claim.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed mb-12 max-w-2xl">
              The private sector is a critical actor in African development. Yet most corporate
              social investment is poorly designed, weakly governed, and essentially unmeasurable.
              These are not failures of intent. They are failures of systems.
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-5">
            {problems.map((p, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white rounded-xl border border-gray-100 p-6 lift">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-brand-navy">{p.issue}</h3>
                  </div>
                  <p className="text-brand-muted text-sm leading-relaxed pl-9">{p.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="py-12 px-6 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-5">Astellic&apos;s Position</p>
            <p className="text-2xl md:text-3xl font-bold leading-snug max-w-3xl mx-auto">
              &ldquo;We are not a CSR activation agency. We are a governance-oriented,
              evidence-driven advisory firm that helps corporations treat social investment
              with the same analytical rigour they apply to core business decisions.&rdquo;
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">What We Do</p>
            <h2 className="text-3xl font-bold text-brand-navy mb-12">Four Service Areas</h2>
          </FadeUp>
          <div className="space-y-8">
            {services.map((svc, si) => (
              <Reveal key={svc.num} variant="up" delay={si * 90}>
              <div className={`bg-brand-light rounded-2xl border-l-4 ${svc.color} p-8 grid md:grid-cols-[1fr_280px] gap-8 items-start lift`}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold text-white ${svc.numBg} px-2.5 py-1 rounded`}>{svc.num}</span>
                    <h3 className="font-bold text-brand-navy text-lg">{svc.title}</h3>
                  </div>
                  <p className="text-brand-muted text-base leading-relaxed">{svc.desc}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Example Engagements</p>
                  <ul className="space-y-1.5 mb-5">
                    {svc.engagements.map((e) => (
                      <li key={e} className="text-sm text-brand-muted flex items-start gap-2">
                        <span className="text-brand-gold mt-0.5 shrink-0">·</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-xs hover:gap-2.5 transition-all"
                  >
                    {svc.cta} →
                  </Link>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Who We Work With</h2>
            <p className="text-brand-muted text-base mb-10 max-w-xl">
              Across the full spectrum of corporate and financial institutions operating in African markets.
            </p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientTypes.map((ct, i) => (
              <Reveal key={ct.label} variant="up" delay={i * 70}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 lift">
                <div className="w-2 h-5 bg-brand-navy rounded-full mb-3" />
                <h3 className="font-bold text-brand-navy text-sm mb-1">{ct.label}</h3>
                <p className="text-brand-muted text-xs leading-relaxed">{ct.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Astellic - stripped */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <SlideLeft>
          <div>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Why Astellic</p>
            <h2 className="text-2xl font-bold text-brand-navy mb-5 leading-snug">
              Development expertise applied to corporate mandates.
            </h2>
            <div className="space-y-4 text-brand-muted text-base leading-relaxed">
              <p>
                Our social impact frameworks are built on the same rigorous standards used by
                the world&apos;s leading development institutions — because we were trained in
                those institutions, and we apply that discipline to corporate work.
              </p>
              <p>
                We are also Africa-specific. We understand the political economy, regulatory
                landscape, and community dynamics that determine whether corporate sustainability
                commitments translate into real outcomes on the ground.
              </p>
            </div>
          </div>
          </SlideLeft>
          <SlideRight>
          <div className="space-y-4">
            {[
              { label: "Development rigour",      desc: "Frameworks built to withstand independent scrutiny — from NGO critics, regulators, and institutional investors" },
              { label: "Africa-specific",         desc: "Grounded in African operating contexts and political economy — not imported frameworks applied generically" },
              { label: "Governance-oriented",     desc: "We treat social investment with the governance discipline it deserves — not as a communications exercise" },
              { label: "Founder-present",         desc: "Senior expertise drives every engagement — the person who designs it is the person who delivers it" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 bg-brand-light rounded-xl p-4">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                <div>
                  <p className="font-bold text-brand-navy text-sm">{item.label}</p>
                  <p className="text-brand-muted text-xs leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          </SlideRight>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Start Here</p>
            <h2 className="text-3xl font-bold mb-5">
              Make Your Social Investment Credible.
            </h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
              Whether you are building a new ESG framework, evaluating an existing programme,
              or designing a community investment strategy from scratch — we will tell you
              honestly what it takes to do it well.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Request a CSI Systems Review
            </Link>
            <Link
              href="/why-astellic"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Why Astellic
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
