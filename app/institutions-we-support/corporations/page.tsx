import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Private Corporations | Astellic",
  description:
    "Astellic helps private corporations build credible, evidence-driven social investment and ESG systems that withstand institutional scrutiny and produce outcomes worth reporting.",
};

const riskCards = [
  {
    title: "Reputational Risk",
    desc: "Impact claims that cannot be substantiated become liabilities when scrutinised by civil society, investigative media, or informed stakeholders.",
  },
  {
    title: "Regulatory Risk",
    desc: "ESG disclosure frameworks increasingly require defensible underlying data. Reporting without it creates material exposure as regulatory environments tighten.",
  },
  {
    title: "Investor Risk",
    desc: "Institutional investors now apply the same analytical rigour to ESG performance that they apply to financial performance. Weak governance is a diligence red flag.",
  },
  {
    title: "Operational Risk",
    desc: "Poorly governed social investment programmes generate community relations friction, licence-to-operate challenges, and internal governance questions that carry operational consequences.",
  },
];

const governanceFailures = [
  {
    num: "01",
    title: "Investment Without Theory of Change",
    desc: "Most corporate social investment programmes allocate budgets without a documented causal logic connecting spend to intended social outcomes. Without a theory of change, there is no basis for measuring impact, no rationale for resource allocation, and no framework for programme improvement. Spending happens. Change is asserted.",
  },
  {
    num: "02",
    title: "Impact Claims Without Defensible Evidence",
    desc: "Impact reports cite beneficiary numbers and activity outputs as evidence of social impact. They rarely are. Reach is not change. Activities are not outcomes. The distance between what a programme claims to have achieved and what it can demonstrate it has achieved is where credibility is lost.",
  },
  {
    num: "03",
    title: "ESG Reporting Without Underlying Data",
    desc: "ESG disclosures are constructed from reporting frameworks rather than from functioning measurement systems. The architecture that would generate reliable social and environmental data — independently verified, consistently collected, methodologically sound — does not exist beneath the disclosure. When it is tested, it does not hold.",
  },
  {
    num: "04",
    title: "Social Spend Without Governance Architecture",
    desc: "Social investment budgets are disbursed without the governance structures — programme boards, independent oversight, disbursement controls, results verification — that the same organisation would apply to any other material expenditure. The resulting opacity creates both compliance exposure and reputational fragility.",
  },
];

const solutions = [
  {
    title: "Social Investment Strategy Design",
    desc: "Building corporate social investment strategies grounded in theory of change, stakeholder analysis, and measurable results frameworks — aligned with business strategy, not managed separately from it.",
  },
  {
    title: "ESG Evidence Systems & Reporting Frameworks",
    desc: "Designing the underlying data architecture, verification protocols, and reporting systems that give ESG disclosures the evidentiary foundation they require to withstand institutional scrutiny.",
  },
  {
    title: "Social Impact Evaluation",
    desc: "Independent evaluation of social investment programmes against their stated theory of change — using methodologically rigorous designs that produce findings defensible to investors, regulators, and civil society.",
  },
  {
    title: "Governance Framework Design",
    desc: "Building the programme governance structures — oversight boards, disbursement controls, results verification mechanisms, and accountability frameworks — that apply fiduciary standards to social spend.",
  },
  {
    title: "Stakeholder Engagement & Social Risk",
    desc: "Structured stakeholder engagement design and social risk assessment, building the community intelligence and licence-to-operate management systems that inform both programme design and executive decision-making.",
  },
  {
    title: "Results Assurance Architecture",
    desc: "Independent assurance of reported social results against primary evidence — giving management, boards, and investors the confidence that disclosed impact reflects what the programme actually achieved.",
  },
];

const clientTypes = [
  "Listed Companies",
  "Financial Institutions",
  "Corporate Foundations",
  "Extractive Industries",
  "Manufacturers &amp; Exporters",
  "Family-Owned Enterprises",
];

export default function CorporationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/thematic-governance.jpg"
          alt="Private Corporations — Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-5 text-sm">
            <Link
              href="/institutions-we-support"
              className="text-brand-gold hover:text-white transition-colors font-medium"
            >
              Institutions We Support
            </Link>
            <span className="text-white/40">›</span>
            <span className="text-white/70">Private Corporations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Private Corporations
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Most corporate social investment programmes cannot demonstrate the impact they claim.
            Not for lack of spending, but for lack of governance, measurement architecture, and
            strategic alignment. We close that gap.
          </p>
        </div>
      </section>

      {/* The Corporate Challenge */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                Why Most Corporate Social Investment Fails the Scrutiny Test
              </h2>
              <p className="text-brand-muted leading-relaxed mb-5">
                Corporate social responsibility is typically managed as an obligation, administered
                by a team operating outside the core business, without the theory of change, results
                frameworks, governance structures, or independent oversight that the same organisation
                applies to any other material commitment. Programmes are designed around disbursement
                rather than impact. Reporting is built around activity rather than evidence. The
                distance between what is claimed and what can be demonstrated is rarely examined
                until it becomes a problem.
              </p>
              <p className="text-brand-muted leading-relaxed">
                Institutional investors, regulators, and informed civil society now apply the same
                scrutiny to ESG and social investment that they apply to financial reporting.
                Companies that cannot demonstrate impact with defensible underlying data are exposed
                — to reputational challenge, to regulatory non-compliance, and to the investor
                questions that follow when ESG disclosures cannot be substantiated. The standard the
                market is moving toward is not aspiration. It is evidence.
              </p>
            </SlideLeft>
            <SlideRight>
              <div className="grid grid-cols-1 gap-4">
                {riskCards.map((r, i) => (
                  <Reveal key={i} variant="up" delay={i * 80}>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lift">
                      <p className="text-brand-green font-bold text-sm mb-1">{r.title}</p>
                      <p className="text-brand-muted text-sm leading-relaxed">{r.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Four Governance Failures */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                Four Governance Failures That Undermine Corporate Social Investment
              </h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Systemic gaps that create credibility exposure — and that are entirely addressable.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {governanceFailures.map((f, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm lift">
                  <span className="inline-block text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded mb-4 tracking-wider">
                    {f.num}
                  </span>
                  <h3 className="text-base font-bold text-brand-navy mb-3">{f.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Astellic's Position */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <blockquote className="border-l-4 border-brand-gold pl-6 text-gray-300 text-xl leading-relaxed italic max-w-3xl mx-auto">
              &ldquo;We are not a CSR activation agency. We apply the same analytical rigour and
              governance standards that development finance institutions use to assess programme
              credibility, to corporate social investment. Because that is the standard the market
              is moving toward.&rdquo;
            </blockquote>
          </FadeUp>
        </div>
      </section>

      {/* Solution Areas */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Our Service Areas</h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Six engagement types that build the governance, evidence, and strategic architecture
                corporate social investment requires to withstand scrutiny.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lift">
                  <div className="h-1 bg-brand-green w-full" />
                  <div className="p-7">
                    <h3 className="text-base font-bold text-brand-navy mb-3">{s.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Who We Work With</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto mb-10">
              We work across the corporate landscape — wherever social investment governance,
              ESG evidence architecture, or impact credibility is a material concern.
            </p>
          </FadeUp>
          <div className="flex flex-wrap justify-center gap-3">
            {clientTypes.map((c, i) => (
              <Reveal key={i} variant="up" delay={i * 50}>
                <span
                  className="bg-brand-light border border-gray-200 text-brand-navy font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm"
                  dangerouslySetInnerHTML={{ __html: c }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold mb-5">
              Build a Social Investment Programme That Withstands Scrutiny
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              Whether you are designing a new social investment strategy, strengthening the
              governance architecture of an existing programme, or building the ESG evidence
              systems your reporting requires, we have a precise entry point for your organisation.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Request a CSI Systems Review
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Discuss ESG Advisory
              </Link>
            </div>
            <Link
              href="/why-astellic"
              className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold hover:gap-3 transition-all"
            >
              Why Astellic
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
