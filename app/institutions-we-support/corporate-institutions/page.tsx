import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corporate Institutions | Institutions We Support | Astellic",
  description:
    "Astellic helps private sector companies, financial institutions, and corporate foundations design credible social investment strategies and measure their development impact.",
};

const services = [
  {
    title: "ESG Strategy & Reporting",
    description:
      "We help corporations move beyond compliance-driven ESG reporting to develop integrated strategies that align social and environmental performance with business value. Our frameworks are built on internationally recognised standards and adapted to African operating contexts.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
  },
  {
    title: "Social Impact Measurement",
    description:
      "We design measurement systems that give companies credible, defensible evidence of the social outcomes their investments create. From theory-of-change development to data collection and analysis, we build the evidence base that stakeholders trust.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "Corporate Social Investment Design",
    description:
      "We help companies design CSI programmes that go beyond philanthropy — creating structured investments that address community needs, strengthen the operating environment, and generate reputational and business value. We align CSI with core business strategy and development best practice.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Sustainable Supply Chain Advisory",
    description:
      "We support companies operating in agricultural, extractive, and manufacturing sectors to assess and improve the social and environmental sustainability of their supply chains — building resilience, managing risk, and meeting the expectations of international buyers and investors.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Shared Value Strategy",
    description:
      "We help companies identify the intersections between their core business activities and pressing social challenges — developing shared value strategies that create competitive advantage while contributing to development outcomes in their operating communities.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Stakeholder Engagement & Social Risk",
    description:
      "We design and facilitate meaningful stakeholder engagement processes, help companies conduct social risk assessments, and develop community relations frameworks — reducing operational risk and building the social licence to operate.",
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

const clientTypes = [
  { label: "Listed Companies", desc: "Corporations with ESG disclosure obligations to stock exchanges and institutional investors" },
  { label: "Financial Institutions", desc: "Commercial banks, investment funds, and insurers aligning portfolios with sustainability standards" },
  { label: "Corporate Foundations", desc: "Company-sponsored foundations managing structured social investment programmes" },
  { label: "Extractive Industries", desc: "Mining, oil & gas, and agribusiness companies managing social and environmental impacts" },
  { label: "Manufacturers & Exporters", desc: "Companies meeting sustainability requirements from international buyers and supply chain auditors" },
  { label: "Family-Owned Enterprises", desc: "Large privately-held businesses building long-term ESG and community investment frameworks" },
];

const differentiators = [
  {
    title: "Development Expertise, Not Just Consulting",
    desc: "We bring deep development sector knowledge to corporate mandates — meaning our social impact frameworks are built on the same rigorous standards used by the world's leading development institutions.",
  },
  {
    title: "Africa-Specific Insight",
    desc: "Our work is grounded in African operating contexts. We understand the political economy, regulatory landscape, and community dynamics that determine whether corporate sustainability commitments translate into real outcomes.",
  },
  {
    title: "Credibility That Holds Up to Scrutiny",
    desc: "Our measurement frameworks and evaluation methodologies are designed to withstand independent scrutiny — from NGO critics, regulators, and institutional investors alike.",
  },
  {
    title: "Strategy Through to Implementation",
    desc: "We do not stop at strategy documents. We stay alongside corporate clients through implementation, helping them adapt as they learn what is working in practice.",
  },
];

export default function CorporateInstitutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Corporate Institutions"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-brand-gold font-semibold tracking-widest uppercase mb-4">
            <Link href="/institutions-we-support" className="hover:text-white transition-colors">
              Institutions We Support
            </Link>
            <span className="text-white/40">›</span>
            <span>Corporate Institutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Corporate Institutions
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Aligning business success with development outcomes.
            We help companies move from social obligation to strategic social value —
            with rigorous measurement, credible frameworks, and honest accountability.
          </p>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-navy mb-5">
              Beyond Compliance. Toward Real Impact.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed mb-5">
              The private sector is an increasingly important actor in African development — not
              just as a source of employment and tax revenue, but as an investor in communities,
              supply chains, and natural systems. Yet most corporate social investment remains
              poorly designed, weakly measured, and disconnected from both business strategy
              and community priorities.
            </p>
            <p className="text-brand-muted text-lg leading-relaxed">
              Astellic helps corporate institutions close that gap. We bring the rigour of
              development evaluation to corporate sustainability and social investment work —
              helping companies understand what their programmes are actually achieving,
              communicate it credibly, and improve over time.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Strategy", value: "Aligned to core business and community need" },
              { label: "Measurement", value: "Credible, defensible impact evidence" },
              { label: "Communication", value: "Transparent reporting that builds trust" },
              { label: "Learning", value: "Adaptive management for continuous improvement" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-2.5 shrink-0" />
                <div>
                  <span className="font-bold text-brand-navy">{item.label}: </span>
                  <span className="text-brand-muted">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Our Services</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">
              From ESG strategy to community investment design, we provide the technical expertise
              to make corporate sustainability credible and effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center mb-5">
                  {svc.icon}
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-3">{svc.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Who We Work With</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              We work across the full spectrum of corporate and financial institutions
              operating in African markets.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clientTypes.map((ct) => (
              <div key={ct.label} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-2 h-6 bg-brand-navy rounded-full mb-4" />
                <h3 className="font-bold text-brand-navy mb-2">{ct.label}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{ct.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Astellic */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Why Astellic for Corporate Mandates</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              We bring a distinctive combination of development rigour and practical business understanding.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((d) => (
              <div key={d.title} className="bg-brand-light rounded-2xl p-7">
                <h3 className="font-bold text-brand-navy mb-3">{d.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Make Your Social Investment Count</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Whether you are building a new ESG framework, evaluating the impact of an existing
            programme, or designing a community investment strategy from scratch — we are ready
            to work alongside you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Start the Conversation
            </Link>
            <Link
              href="/what-we-do"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Our Methodology
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
