import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Development Partners | Institutions We Support | Astellic",
  description:
    "Astellic partners with UN agencies, international NGOs, and implementing organisations to sharpen programme design, build M&E systems, and strengthen delivery capacity.",
};

const services = [
  {
    title: "Programme Design & Theory of Change",
    description:
      "We work with development partners to design programmes that are grounded in evidence, have a coherent theory of change, and are built for the realities of implementation. We facilitate participatory design processes and conduct context and feasibility analyses that shape programme architecture from the start.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    title: "M&E Systems Design & Management",
    description:
      "We design monitoring, evaluation, and learning systems that generate timely, actionable information for adaptive programme management. Our M&E frameworks go beyond compliance reporting to create genuine learning loops that help programmes improve in real time.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Programme Evaluation",
    description:
      "We conduct independent and joint evaluations across the full results chain — from implementation fidelity and output delivery through to outcome and impact assessment. Our evaluations are designed to produce actionable learning, not just accountability documentation.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
      </svg>
    ),
  },
  {
    title: "Capacity Development",
    description:
      "We build the human and institutional capacity of partner organisations and government counterparts — through structured training, on-the-job coaching, systems design, and knowledge transfer. We design capacity development programmes that stick beyond the project lifecycle.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Knowledge Management & Learning Systems",
    description:
      "We design knowledge management systems that capture what development programmes are learning and make it accessible for practitioners, policy makers, and future programme designers. We help organisations move from data rich to knowledge useful.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Technical Assistance & Embedded Support",
    description:
      "We provide embedded technical assistance to implementing partners and government counterparts — placing our specialists within teams to provide day-to-day support on programme delivery, data management, policy analysis, and institutional strengthening.",
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
];

const clientTypes = [
  { label: "UN Agencies", desc: "UNDP, UNICEF, WHO, WFP, UNFPA, and other multilateral implementing bodies" },
  { label: "International NGOs", desc: "Global and regional NGOs delivering health, education, livelihoods, and humanitarian programmes" },
  { label: "Research Consortia", desc: "Multi-partner research programmes generating evidence for policy across Africa" },
  { label: "Implementing Partners", desc: "Local and national organisations sub-contracting from or partnering with international agencies" },
  { label: "Regional Bodies", desc: "African Union, SADC, ECOWAS, and other regional intergovernmental organisations" },
  { label: "Social Enterprises", desc: "Mission-driven organisations scaling solutions to development challenges" },
];

const valueProps = [
  {
    number: "01",
    title: "We Work at the Whole System Level",
    desc: "We do not just evaluate programmes in isolation. We analyse how programmes fit within national systems, policy environments, and institutional landscapes — and we design interventions that strengthen those systems, not just individual projects.",
  },
  {
    number: "02",
    title: "We Build Adaptive Learning into Everything",
    desc: "Astellic's approach to M&E is rooted in adaptive management. We design systems that generate learning for course-correction during implementation — not just summative evidence for the final report.",
  },
  {
    number: "03",
    title: "We Are Honest About What the Evidence Shows",
    desc: "Our evaluations and reviews are independent and evidence-driven. We report what the data shows — including what is not working — because that is the only basis on which programmes can genuinely improve.",
  },
  {
    number: "04",
    title: "We Leave Capacity Behind",
    desc: "Our engagements are structured to build the capacity of partner organisations and national counterparts. When we exit, the systems, tools, and skills we introduced remain operational.",
  },
];

export default function DevelopmentPartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Development Partners"
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
            <span>Development Partners</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Development Partners
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Stronger programmes. Sharper evidence. Lasting capacity.
            We work alongside implementing organisations to design better programmes,
            build M&E systems that drive real learning, and develop the institutional
            capacity to support sustained implementation at scale.
          </p>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <SlideLeft>
            <div>
              <h2 className="text-3xl font-bold text-brand-navy mb-5">
                The Implementation Gap Is Still the Biggest Problem
              </h2>
              <p className="text-brand-muted text-lg leading-relaxed mb-5">
                Decades of development investment have produced an uncomfortable truth: even
                well-designed programmes frequently underdeliver. The gap between what was planned
                and what was achieved is rarely about intent — it is almost always about the quality
                of systems, evidence, and adaptive management capacity available to those doing the work.
              </p>
              <p className="text-brand-muted text-lg leading-relaxed">
                Astellic exists to close that gap for development partners. We bring the analytical
                rigour of evaluation research together with the practical experience of implementation
                support — helping partners design programmes that are more likely to work, monitor them
                with data that actually drives decisions, and build the institutional capacity to
                sustain results after external support ends.
              </p>
            </div>
          </SlideLeft>
          <SlideRight>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-6">The Astellic Difference</p>
            <div className="space-y-5">
              {[
                { label: "Design", value: "Evidence-based, context-adapted programme architecture" },
                { label: "Monitor", value: "Real-time data systems that inform adaptive management" },
                { label: "Evaluate", value: "Independent, rigorous, and actionable findings" },
                { label: "Learn", value: "Knowledge systems that make insight accessible and used" },
                { label: "Strengthen", value: "Capacity that outlasts the project" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-teal" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy text-sm">{item.label}: </span>
                    <span className="text-brand-muted text-sm">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </SlideRight>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">What We Deliver</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">
              Our development partner services span the full cycle from programme design
              through implementation support, evaluation, and learning.
            </p>
          </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <Reveal key={svc.title} variant="up" delay={i * 80}>
              <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow lift">
                <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center mb-5">
                  {svc.icon}
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-3">{svc.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{svc.description}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Who We Work With</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              Our development partner portfolio spans the full range of organisations
              working to deliver development outcomes in Africa.
            </p>
          </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clientTypes.map((ct, i) => (
              <Reveal key={ct.label} variant="up" delay={i * 70}>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm lift">
                <div className="w-2 h-6 bg-brand-teal rounded-full mb-4" />
                <h3 className="font-bold text-brand-navy mb-2">{ct.label}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{ct.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">What Sets Our Partnerships Apart</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              We approach every development partner engagement with the same core commitments.
            </p>
          </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-7">
            {valueProps.map((vp, i) => (
              <Reveal key={vp.number} variant="up" delay={i * 80}>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <span className="text-brand-teal font-bold text-sm">{vp.number}</span>
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy mb-2">{vp.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{vp.desc}</p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Whether you need an evaluation partner, help designing a new programme,
              support building an M&E system, or embedded technical assistance for a
              complex implementation — we are here to work alongside you.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Get in Touch
            </Link>
            <Link
              href="/propose-partnership"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Propose a Partnership
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
