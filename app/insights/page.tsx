import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, FadeIn, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Insights & Thinking | Astellic",
  description:
    "Implementation briefs, MERL insights, policy perspectives, and institutional intelligence from Astellic — analytical intelligence from the front lines of African development systems.",
};

const categories = [
  { label: "All",                        slug: "all"         },
  { label: "Implementation Brief",        slug: "brief"       },
  { label: "MERL Insight",                slug: "merl"        },
  { label: "Perspective",                 slug: "perspective" },
  { label: "Policy Commentary",           slug: "policy"      },
  { label: "Corporate Social Investment", slug: "csi"         },
];

const featured = {
  category: "Implementation Brief",
  categoryColor: "bg-brand-navy",
  issueLabel: "Issue 01 — Q3 2026",
  title: "Why Implementation Readiness Reviews Must Happen Before Programmes Launch",
  excerpt: "The most preventable programme failures begin not at the point of delivery, but in the design phase — when implementation readiness is assumed rather than assessed. After reviewing multiple programme cycles, a consistent pattern emerges: organisations that invest in implementation readiness diagnostics before launch experience significantly fewer mid-course failures.",
  readTime: "6 min read",
  href: "/insights",
};

const articles = [
  {
    category: "MERL Insight",
    categoryColor: "bg-brand-teal",
    title: "When M&E Becomes a Compliance Exercise: The Cost of Learning-Blind Monitoring",
    excerpt: "Programmes that design M&E systems around donor reporting frameworks rather than decision-making needs consistently miss the learning they most need to course-correct.",
    readTime: "5 min read",
    href: "/insights",
  },
  {
    category: "Perspective",
    categoryColor: "bg-brand-gold",
    title: "Data Quality in African Health Systems: Patterns From the Field",
    excerpt: "After conducting data quality audits across multiple programme cycles, consistent patterns emerge that challenge assumptions about the reliability of routine health data.",
    readTime: "7 min read",
    href: "/insights",
  },
  {
    category: "Policy Commentary",
    categoryColor: "bg-brand-green",
    title: "The Political Economy of Implementation: Why Good Policies Fail Anyway",
    excerpt: "Technical quality is a necessary but insufficient condition for policy success. The institutions, incentives, and power structures that determine implementation outcomes are rarely part of the policy design process.",
    readTime: "8 min read",
    href: "/insights",
  },
  {
    category: "Corporate Social Investment",
    categoryColor: "bg-brand-navy",
    title: "Social Investment Readiness: Why Most CSR Programmes Are Not Ready to Measure Impact",
    excerpt: "Most corporate social investment programmes struggle not because of weak intent, but because the evidence, governance, and learning systems required to demonstrate impact were never built.",
    readTime: "5 min read",
    href: "/insights",
  },
  {
    category: "Implementation Brief",
    categoryColor: "bg-brand-navy",
    title: "Adaptive MERL in Practice: A Field Guide for Programme Managers",
    excerpt: "Adaptive management is widely endorsed and poorly understood. This brief provides a practical framework for embedding adaptive MERL into programme operations without restructuring the entire monitoring system.",
    readTime: "9 min read",
    href: "/insights",
  },
  {
    category: "MERL Insight",
    categoryColor: "bg-brand-teal",
    title: "The Evaluation That Changed the Programme: What Happens When Findings Are Actually Used",
    excerpt: "The gap between evaluation findings and programme decisions is well documented. Less documented are the conditions under which that gap closes — and what it looks like when evaluation actually drives adaptation.",
    readTime: "6 min read",
    href: "/insights",
  },
];

const contentTypes = [
  {
    icon: (
      <svg className="w-5 h-5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Implementation Briefs",
    desc: "4–6 page evidence-based briefs on specific practical challenges in programme delivery, MERL, and policy implementation.",
    accent: "bg-brand-navy/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "MERL Insights",
    desc: "Practical intelligence on monitoring, evaluation, research, and learning — drawn from field experience in African programme contexts.",
    accent: "bg-brand-teal/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Perspectives",
    desc: "Editorial pieces on development systems, institutional reform, and the gap between policy ambition and delivery reality.",
    accent: "bg-brand-gold/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
    title: "Policy Commentary",
    desc: "Short-form analysis on current policy developments, implementation challenges, and institutional reform across our thematic domains.",
    accent: "bg-brand-green/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    title: "Corporate Social Investment",
    desc: "Intelligence on CSI strategy, ESG evidence systems, and impact measurement for private sector actors operating in African markets.",
    accent: "bg-brand-navy/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: "Institutional Diagnostics",
    desc: "In-depth analytical pieces on specific institutional challenges — governance failures, MERL system weaknesses, delivery breakdowns — with practical recommendations.",
    accent: "bg-brand-teal/10",
  },
];

export default function InsightsPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic Insights — institutional intelligence"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Astellic Insights
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            Intelligence from the field.<br />Built for the decision-maker.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed mb-8">
            Implementation briefs, MERL insights, policy perspectives, and institutional
            diagnostics — grounded in practical experience across African development systems.
          </p>
          {/* Launch note */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-5 py-3">
            <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
            <p className="text-gray-300 text-sm">
              <span className="text-white font-semibold">Series launches Q3 2026.</span>{" "}
              Articles in this collection are forthcoming — subscribe below to be notified.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Types ─────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-brand-gold rounded" />
            <h2 className="text-base font-bold text-brand-navy uppercase tracking-widest">
              What We Publish
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((ct, i) => (
              <Reveal key={ct.title} variant="up" delay={i * 60}>
                <div className={`flex items-start gap-4 p-4 rounded-xl ${ct.accent}`}>
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    {ct.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-sm mb-1">{ct.title}</h3>
                    <p className="text-brand-muted text-xs leading-relaxed">{ct.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial Position ───────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="border-l-4 border-brand-gold pl-6">
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">
                Editorial Position
              </p>
              <p className="text-brand-navy text-xl font-semibold leading-snug mb-3">
                We publish because we think more clearly in public.
              </p>
              <p className="text-brand-muted text-base leading-relaxed">
                The Insights series is not a marketing channel. It is an intellectual commitment —
                to thinking rigorously about the systems we work in, sharing what we find with
                practitioners who can use it, and building a body of analytical work that outlasts
                any individual engagement. We publish with deliberate selectivity. Quality
                over volume, always.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Featured Article ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">Lead Brief</p>
            <span className="text-xs text-brand-muted border border-dashed border-gray-300 rounded-full px-3 py-1">
              Forthcoming
            </span>
          </div>
          <ScaleIn delay={100}>
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 grid md:grid-cols-[240px_1fr]">
              <div className={`${featured.categoryColor} text-white p-10 flex flex-col justify-between`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                    {featured.category}
                  </p>
                  <p className="text-white/50 text-xs mt-1">{featured.issueLabel}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center mt-auto">
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25" />
                  </svg>
                </div>
              </div>
              <div className="p-10">
                <h2 className="text-2xl font-bold text-brand-navy mb-4 leading-snug">
                  {featured.title}
                </h2>
                <p className="text-brand-muted text-base leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-brand-muted text-sm">{featured.readTime}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted border border-dashed border-gray-300 rounded-full px-3 py-1">
                    Publishes Q3 2026
                  </span>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* ── Article Grid ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-brand-navy">Forthcoming Articles</h2>
              <p className="text-brand-muted text-sm mt-1">
                Browse the series by type. Live filtering activates at launch.
              </p>
            </div>
            {/* Category filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat, i) => (
                <span
                  key={cat.slug}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-default ${
                    i === 0
                      ? "bg-brand-navy text-white"
                      : "bg-brand-light text-brand-muted"
                  }`}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <Reveal key={article.title} variant="up" delay={i * 80}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col lift">
                  <div className={`${article.categoryColor} text-white px-5 py-2.5`}>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <h3 className="font-bold text-brand-navy text-base leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-brand-muted text-sm leading-relaxed flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-brand-muted text-xs">{article.readTime}</span>
                      <span className="text-xs text-gray-400 italic">Forthcoming</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Forthcoming notice */}
          <div className="mt-10 border border-dashed border-gray-200 rounded-xl py-8 px-6 text-center">
            <p className="text-brand-muted text-sm">
              These articles are in development and will publish from Q3 2026.{" "}
              <Link href="#subscribe" className="text-brand-gold font-semibold hover:underline">
                Subscribe below
              </Link>{" "}
              to be notified when the first brief is available.
            </p>
          </div>
        </div>
      </section>

      {/* ── Subscribe ────────────────────────────────────────────────────── */}
      <section id="subscribe" className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <SlideLeft>
              <div>
                <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">
                  Stay Informed
                </p>
                <h2 className="text-3xl font-bold mb-5 leading-snug">
                  The Astellic Knowledge Engine
                </h2>
                <p className="text-gray-300 text-base leading-relaxed">
                  The full Insights section — with downloadable PDFs, author pages, and category
                  filtering — launches in Q3 2026. The first Implementation Brief will be the
                  inaugural issue.
                </p>
                <div className="mt-6 space-y-2">
                  {[
                    "Quarterly at most — no filler content",
                    "Implementation briefs in downloadable PDF",
                    "Policy commentary from active field engagements",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-brand-gold mt-0.5 shrink-0">·</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SlideLeft>
            <SlideRight>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <p className="text-white font-semibold mb-4 text-sm">
                  Notify me when the first brief publishes
                </p>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded px-4 py-3 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                  />
                  <Link
                    href="/contact"
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-3 rounded transition-colors text-sm text-center"
                  >
                    Subscribe via Contact
                  </Link>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Or send a note through our contact page — quarterly at most.
                </p>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>
    </>
  );
}
