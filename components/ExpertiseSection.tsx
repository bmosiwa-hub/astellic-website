"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeUp, Reveal } from "@/components/Reveal";

// ── Data ──────────────────────────────────────────────────────────────────────

interface ExpertiseArea {
  id:    string;
  tab:   string; // short label for the tab list
  title: string; // full name, shown in the featured panel
  desc:  string;
  img:   string;
  alt:   string;
}

const AREAS: ExpertiseArea[] = [
  {
    id:    "research",
    tab:   "Research & Evaluation",
    title: "Research, Implementation Science & Evaluation",
    desc:  "Generating rigorous evidence through research, assessments, and evaluations to understand what works, why, and under what conditions.",
    img:   "/images/expertise/research.jpg",
    alt:   "A researcher facilitating a community discussion under a shaded veranda",
  },
  {
    id:    "policy",
    tab:   "Policy & Governance",
    title: "Political Economy, Policy & Governance",
    desc:  "Understanding policy environments, institutional dynamics, stakeholder interests, and governance challenges to inform strategic decisions and reform.",
    img:   "/images/expertise/policy.jpg",
    alt:   "Delegates seated at round tables during a stakeholder policy forum",
  },
  {
    id:    "financing",
    tab:   "Health Financing",
    title: "Health Financing & Economic Analysis",
    desc:  "Generating economic and financing insights to support resource allocation, financing strategies, investment decisions, and sustainability.",
    img:   "/images/expertise/financing.jpg",
    alt:   "An analyst working through financial charts with a calculator",
  },
  {
    id:    "programme-design",
    tab:   "Programme Design",
    title: "Programme Design & Strategic Advisory",
    desc:  "Helping organizations translate priorities and evidence into well-designed programmes, strategies, interventions, and actionable plans.",
    img:   "/images/expertise/programme-design.jpg",
    alt:   "Hands mapping a programme design on a whiteboard",
  },
  {
    id:    "implementation",
    tab:   "Implementation",
    title: "Implementation Support & Systems Strengthening",
    desc:  "Supporting programme delivery, strengthening institutional and operational capacity, and addressing implementation challenges.",
    img:   "/images/expertise/implementation.jpg",
    alt:   "Health workers in scrubs walking along a busy town street",
  },
  {
    id:    "meal-data",
    tab:   "MEAL & Data",
    title: "Adaptive MEAL, Data & Performance Intelligence",
    desc:  "Strengthening monitoring, data quality, performance management, learning, and adaptive decision-making.",
    img:   "/images/expertise/meal-data.jpg",
    alt:   "A team reviewing performance dashboards during a data meeting",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExpertiseSection() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const area = AREAS[active];

  // Roving focus: arrows move between tabs (both axes, since the list is
  // horizontal on mobile and vertical on desktop), Home/End jump to the ends.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = AREAS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End")  next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  }

  // On mobile the tabs sit in a horizontal strip: keep the chosen one in view
  // by scrolling the strip only, never the page.
  function select(i: number) {
    setActive(i);
    const el = tabRefs.current[i];
    const list = el?.parentElement;
    if (!el || !list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: el.offsetLeft - 24, behavior: "smooth" });
  }

  const servicesLink = (
    <Link
      href="/what-we-do"
      className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-white transition-colors"
    >
      Explore Our Services
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );

  return (
    <section className="py-24 px-6 bg-brand-navy text-white" aria-labelledby="expertise-heading">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
        {/* ── Left: intro + word tabs ─────────────────────────────────────── */}
        <div className="min-w-0 flex flex-col">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-3">
              Our Expertise
            </p>
            <h2 id="expertise-heading" className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              Our Areas of Expertise
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              We bring together research, policy, strategic insight, and implementation expertise to help
              organizations navigate complex health systems challenges and translate ideas into meaningful results.
            </p>
          </FadeUp>

          <div
            role="tablist"
            aria-label="Areas of expertise"
            onKeyDown={onKeyDown}
            className="relative mt-10 lg:mt-12 -mx-6 px-6 lg:mx-0 lg:px-0 flex lg:flex-col gap-6 lg:gap-0 overflow-x-auto lg:overflow-visible snap-x scroll-px-6 lg:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-white/10 lg:border-b-0 lg:border-t"
          >
            {AREAS.map((a, i) => {
              const selected = i === active;
              return (
                <button
                  key={a.id}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  id={`expertise-tab-${a.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="expertise-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`group relative shrink-0 snap-start flex items-baseline gap-3 text-left py-3 lg:py-4 lg:border-b lg:border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 focus-visible:ring-offset-4 focus-visible:ring-offset-brand-navy rounded-sm transition-colors duration-300 ${
                    selected ? "text-white" : "text-white/55 hover:text-white/85"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold tabular-nums tracking-widest transition-colors duration-300 ${
                      selected ? "text-brand-gold" : "text-white/35 group-hover:text-white/55"
                    }`}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="text-base lg:text-xl font-semibold whitespace-nowrap">{a.tab}</span>
                  {/* Active indicator: a fine gold rule that draws in under the label */}
                  <span
                    aria-hidden
                    className={`absolute left-0 bottom-0 lg:-bottom-px h-0.5 bg-brand-gold origin-left transition-transform duration-500 ease-out motion-reduce:transition-none w-full ${
                      selected ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block mt-auto pt-10">{servicesLink}</div>
        </div>

        {/* ── Right: featured image + active area ─────────────────────────── */}
        <Reveal variant="fade" delay={120} className="min-w-0">
          <div
            id="expertise-panel"
            role="tabpanel"
            aria-labelledby={`expertise-tab-${area.id}`}
            className="relative overflow-hidden rounded-lg bg-[#0b1a38] aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]"
          >
            {AREAS.map((a, i) => (
              <Image
                key={a.id}
                src={a.img}
                alt={i === active ? a.alt : ""}
                aria-hidden={i !== active}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className={`object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                  i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
                }`}
              />
            ))}

            {/* Scrim for legible caption text */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b1a38]/95 via-[#0b1a38]/35 to-transparent" />

            <div key={area.id} className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10 motion-safe:animate-fade-up">
              <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] tabular-nums text-brand-gold mb-3">
                <span>{pad(active + 1)} / {pad(AREAS.length)}</span>
                <span aria-hidden className="h-px w-8 bg-brand-gold/60" />
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold leading-snug max-w-xl mb-3">{area.title}</h3>
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-xl">{area.desc}</p>
            </div>
          </div>
        </Reveal>

        <div className="lg:hidden">{servicesLink}</div>
      </div>
    </section>
  );
}
