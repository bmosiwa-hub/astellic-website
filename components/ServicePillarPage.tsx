import type { ReactNode } from "react";
import Link from "next/link";
import { FadeUp, Reveal } from "@/components/Reveal";

export type ServiceArea = { title: string; description: string; services: string[] };
type Props = {
  eyebrow: string; title: string; subtitle: string; intro: string; illustration: ReactNode;
  color: "navy" | "teal" | "green"; why: string; areas: ServiceArea[];
  bridgeTitle: string; bridge: string; assignments: string[]; current: string;
};
const styles = {
  navy: { hero: "bg-brand-navy", line: "bg-brand-navy", text: "text-brand-navy", button: "bg-brand-navy hover:bg-brand-navy/90" },
  teal: { hero: "bg-brand-teal", line: "bg-brand-teal", text: "text-brand-teal", button: "bg-brand-teal hover:bg-brand-teal/90" },
  green: { hero: "bg-brand-green", line: "bg-brand-green", text: "text-brand-green", button: "bg-brand-green hover:bg-brand-green/90" },
};
const pillars = [
  ["Evidence", "/what-we-do/evidence", "Generate credible evidence, insights and intelligence."],
  ["Policy", "/what-we-do/policy", "Translate evidence into decisions and strategy."],
  ["Implementation", "/what-we-do/implementation", "Turn decisions into effective programmes and learning."],
];

export default function ServicePillarPage({ eyebrow, title, subtitle, intro, illustration, color, why, areas, bridgeTitle, bridge, assignments, current }: Props) {
  const s = styles[color];
  return <>
    <section className={`relative ${s.hero} text-white py-24 md:py-28 px-6 overflow-hidden`}>
      <div className="absolute inset-0 opacity-65">{illustration}</div><div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto"><p className="text-white/70 text-sm mb-7"><Link className="hover:text-white" href="/what-we-do">What We Do</Link> <span className="mx-2">/</span>{eyebrow}</p><p className="text-brand-gold text-sm font-bold uppercase tracking-[0.22em] mb-4">{eyebrow}</p><h1 className="text-4xl md:text-6xl font-bold leading-[1.08] max-w-3xl mb-5">{title}</h1><p className="text-xl md:text-2xl font-medium max-w-3xl mb-5">{subtitle}</p><p className="text-gray-200 text-lg leading-relaxed max-w-2xl">{intro}</p></div>
    </section>
    <section className="py-16 md:py-20 px-6"><div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-7"><div className={`w-12 h-1 mt-3 rounded ${s.line}`} /><FadeUp><p className="text-brand-gold text-sm font-bold uppercase tracking-[.2em] mb-3">Why it matters</p><p className="text-2xl md:text-3xl font-bold text-brand-navy leading-snug">{why}</p></FadeUp></div></section>
    <section className="py-20 px-6 bg-brand-light"><div className="max-w-6xl mx-auto"><FadeUp><p className="text-brand-gold text-sm font-bold uppercase tracking-[.2em] mb-3">Service areas</p><h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-12">Specialist support for health policy and systems.</h2></FadeUp><div className="grid md:grid-cols-2 gap-px border border-gray-200 bg-gray-200 rounded-2xl overflow-hidden">{areas.map((area, i) => <Reveal key={area.title} variant="up" delay={i * 60}><article className="bg-white p-7 md:p-8 h-full"><p className={`font-bold text-sm tracking-widest ${s.text} mb-5`}>0{i + 1}</p><h3 className="text-xl font-bold text-brand-navy mb-3">{area.title}</h3><p className="text-brand-muted leading-relaxed mb-6">{area.description}</p><ul className="border-t border-gray-100 pt-5 space-y-2">{area.services.map(x => <li className="flex gap-2 text-sm text-brand-muted" key={x}><span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${s.line}`} />{x}</li>)}</ul></article></Reveal>)}</div></div></section>
    <section className="py-20 px-6"><div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12"><FadeUp><p className="text-brand-gold text-sm font-bold uppercase tracking-[.2em] mb-3">How we work</p><h2 className="text-3xl font-bold text-brand-navy mb-5">{bridgeTitle}</h2><p className="text-brand-muted text-lg leading-relaxed">{bridge}</p></FadeUp><div className="bg-brand-light border-l-4 border-brand-gold p-7 text-brand-navy text-lg font-semibold leading-relaxed">Evidence generates insight. Policy shapes decisions. Implementation turns decisions into results.</div></div></section>
    <section className="py-16 px-6 bg-brand-light"><div className="max-w-5xl mx-auto"><p className="text-brand-gold text-sm font-bold uppercase tracking-[.2em] mb-3">Assignments we support</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{assignments.map(x => <div key={x} className="bg-white px-5 py-4 text-sm text-brand-muted border border-gray-100">{x}</div>)}</div></div></section>
    <section className="py-16 px-6"><div className="max-w-5xl mx-auto"><p className="text-brand-gold text-sm font-bold uppercase tracking-[.2em] mb-5">Our integrated model</p><div className="grid md:grid-cols-3 border border-gray-200 rounded-2xl overflow-hidden">{pillars.map(([name, href, desc], i) => <Link key={name} href={href} className={`p-6 border-b md:border-b-0 md:border-r last:border-0 border-gray-200 ${name === current ? "bg-brand-light" : "hover:bg-brand-light"}`}><p className="text-xs font-bold text-brand-gold mb-3">0{i + 1}</p><p className="text-xl font-bold text-brand-navy mb-2">{name}</p><p className="text-sm text-brand-muted">{desc}</p>{name === current && <p className="text-xs font-bold text-brand-gold mt-4">Current pillar</p>}</Link>)}</div></div></section>
    <section className="py-20 px-6 bg-brand-navy text-white text-center"><div className="max-w-3xl mx-auto"><h2 className="text-3xl md:text-4xl font-bold mb-5">Have a challenge that requires evidence, strategic thinking, or implementation support?</h2><p className="text-gray-300 text-lg mb-8">Let&apos;s explore how Astellic can support your organization to generate insights, inform decisions, or strengthen delivery.</p><Link href="/contact" className="inline-block bg-brand-gold hover:bg-brand-gold/90 font-semibold px-8 py-3 rounded">Discuss an Assignment</Link></div></section>
  </>;
}
