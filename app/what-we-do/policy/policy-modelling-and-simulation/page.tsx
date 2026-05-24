import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Policy Modelling and Simulation | Policy | Astellic",
  description:
    "Astellic's Policy Modelling and Simulation sub-unit: quantitative and qualitative modelling, scenario analysis, simulation modelling, and data-driven policy analytics for evidence-informed reform decisions.",
};

const services = [
  {
    label: "Quantitative Policy Modelling and Forecasting",
    desc: "Development of quantitative models to forecast the likely effects of policy choices across health, education, fiscal, and governance sectors, enabling decision-makers to compare alternatives on the basis of evidence rather than assumption.",
  },
  {
    label: "Scenario Analysis and Stress-Testing",
    desc: "Structured scenario analysis that tests policy options and reform alternatives against a range of political, economic, and institutional conditions, identifying which choices are robust across multiple possible futures.",
  },
  {
    label: "Simulation Modelling for Policy Impact Assessment",
    desc: "Simulation modelling for ex-ante policy impact assessment, including systems dynamics models, agent-based models, and other simulation techniques that reveal how policy interventions are likely to behave in complex real-world systems.",
  },
  {
    label: "Data-Driven Policy Analytics and Evidence Synthesis",
    desc: "Analytical dashboards, indicator modelling, and evidence synthesis products that give policymakers and programme designers a real-time, data-informed picture of the systems they are trying to change and the levers available to them.",
  },
];

export default function PolicyModellingSimulationPage() {
  return (
    <>
      <section className="bg-brand-teal text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-teal-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy</Link>
            <span>/</span>
            <span className="text-white font-semibold">Policy Modelling and Simulation</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Policy Modelling<br />and Simulation</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Quantitative and qualitative modelling to test policy options, forecast impact, and strengthen the evidence base for reform decisions.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We build models that let policymakers explore the likely effects of alternative
            choices before committing resources. From health financing simulations to fiscal
            impact modelling, our work ensures that policy decisions are stress-tested against
            evidence, not made on intuition alone.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Policy decisions made without modelling are bets placed without odds. Whether
            designing a health financing reform, an education sector investment, or a fiscal
            policy shift, the range of possible outcomes is wide and the risks of unintended
            consequences are real. The Policy Modelling and Simulation sub-unit addresses
            this by providing the analytical infrastructure to test, compare, and refine
            policy options before they are locked in. We combine quantitative rigour with
            deep sector knowledge to produce models that are technically sound, contextually
            grounded, and genuinely useful for decision-making.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl p-6 lift">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-teal">{s.label}</h3>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed pl-4">{s.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <p className="font-bold text-brand-navy">Need policy options stress-tested?</p>
            <p className="text-brand-muted text-sm">We work with ministries, donors, and policy units designing reform programmes.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Discuss Policy Modelling
            </Link>
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Back to Pillar 02
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
