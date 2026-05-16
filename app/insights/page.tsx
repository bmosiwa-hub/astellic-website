import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights & Thinking | Astellic",
  description:
    "Implementation briefs, MERL insights, policy perspectives, and institutional intelligence from Astellic — the firm that understands why African development systems fail, and how to make them work.",
};

const categories = [
  { label: "All",                        slug: "all",         active: true  },
  { label: "Implementation Brief",        slug: "brief",       active: false },
  { label: "MERL Insight",                slug: "merl",        active: false },
  { label: "Perspective",                 slug: "perspective", active: false },
  { label: "Policy Commentary",           slug: "policy",      active: false },
  { label: "Corporate Social Investment", slug: "csi",         active: false },
];

const featured = {
  category: "Implementation Brief",
  categoryColor: "bg-brand-navy",
  title: "Why Implementation Readiness Reviews Must Happen Before Programmes Launch",
  excerpt: "The most preventable programme failures begin not at the point of delivery, but in the design phase — when implementation readiness is assumed rather than assessed. After reviewing multiple programme cycles, a consistent pattern emerges: organisations that invest in implementation readiness diagnostics before launch experience significantly fewer mid-course failures.",
  readTime: "6 min read",
  date: "Coming Q3 2026",
  href: "/insights",
};

const articles = [
  {
    category: "MERL Insight",
    categoryColor: "bg-brand-teal",
    title: "When M&E Becomes a Compliance Exercise: The Cost of Learning-Blind Monitoring",
    excerpt: "Programmes that design M&E systems around donor reporting frameworks rather than decision-making needs consistently miss the learning they most need to course-correct.",
    readTime: "5 min read",
    date: "Coming Q3 2026",
    href: "/insights",
  },
  {
    category: "Perspective",
    categoryColor: "bg-brand-gold",
    title: "Data Quality in African Health Systems: Patterns From the Field",
    excerpt: "After conducting data quality audits across multiple programme cycles, consistent patterns emerge that challenge assumptions about the reliability of routine health data.",
    readTime: "7 min read",
    date: "Coming Q3 2026",
    href: "/insights",
  },
  {
    category: "Policy Commentary",
    categoryColor: "bg-brand-green text-white",
    title: "The Political Economy of Implementation: Why Good Policies Fail Anyway",
    excerpt: "Technical quality is a necessary but insufficient condition for policy success. The institutions, incentives, and power structures that determine implementation outcomes are rarely part of the policy design process.",
    readTime: "8 min read",
    date: "Coming Q3 2026",
    href: "/insights",
  },
  {
    category: "Corporate Social Investment",
    categoryColor: "bg-brand-navy",
    title: "Social Investment Readiness: Why Most CSR Programmes Are Not Ready to Measure Impact",
    excerpt: "Most corporate social investment programmes struggle not because of weak intent, but because the evidence, governance, and learning systems required to demonstrate impact were never built.",
    readTime: "5 min read",
    date: "Coming Q3 2026",
    href: "/insights",
  },
  {
    category: "Implementation Brief",
    categoryColor: "bg-brand-navy",
    title: "Adaptive MERL in Practice: A Field Guide for Programme Managers",
    excerpt: "Adaptive management is widely endorsed and poorly understood. This brief provides a practical framework for embedding adaptive MERL into programme operations without restructuring the entire monitoring system.",
    readTime: "9 min read",
    date: "Coming Q4 2026",
    href: "/insights",
  },
  {
    category: "MERL Insight",
    categoryColor: "bg-brand-teal",
    title: "The Evaluation That Changed the Programme: What Happens When Findings Are Actually Used",
    excerpt: "The gap between evaluation findings and programme decisions is well documented. Less documented are the conditions under which that gap closes — and what it looks like when evaluation actually drives adaptation.",
    readTime: "6 min read",
    date: "Coming Q4 2026",
    href: "/insights",
  },
];

const contentTypes = [
  {
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Implementation Briefs",
    desc: "4–6 page evidence-based briefs on specific practical challenges in programme delivery, MERL, and policy implementation. Published quarterly.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "MERL Insights",
    desc: "Practical intelligence on monitoring, evaluation, research, and learning — drawn from field experience in African programme contexts.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Perspectives",
    desc: "Editorial pieces on development systems, institutional reform, and the gap between policy ambition and delivery reality.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
    title: "Policy Commentary",
    desc: "Short-form analysis on current policy developments, implementation challenges, and institutional reform across our thematic domains.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    title: "Corporate Social Investment",
    desc: "Intelligence on CSI strategy, ESG evidence systems, and impact measurement for private sector actors operating in African markets.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: "Institutional Diagnostics",
    desc: "In-depth analytical pieces on specific institutional challenges — governance failures, MERL system weaknesses, delivery breakdowns — with practical recommendations.",
  },
];

export default function InsightsPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic Insights — institutional intelligence"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Astellic Insights
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            The firm that understands why systems fail.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Implementation briefs, MERL insights, policy perspectives, and institutional
            intelligence from the front lines of African development.
          </p>
        </div>
      </section>

      {/* ── Content Types ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {contentTypes.map((ct) => (
              <div key={ct.title} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center shrink-0">
                  {ct.icon}
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy text-sm mb-1">{ct.title}</h3>
                  <p className="text-brand-muted text-xs leading-relaxed">{ct.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Article ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-6">Featured</p>
          <Link
            href={featured.href}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid md:grid-cols-[1fr_2fr] border border-gray-100"
          >
            <div className={`${featured.categoryColor} text-white p-10 flex flex-col justify-end`}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">{featured.category}</p>
              <p className="text-sm text-white/60">{featured.date}</p>
            </div>
            <div className="p-10">
              <h2 className="text-2xl font-bold text-brand-navy mb-4 leading-snug group-hover:text-brand-teal transition-colors">
                {featured.title}
              </h2>
              <p className="text-brand-muted text-base leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted text-sm">{featured.readTime}</span>
                <span className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm group-hover:gap-2.5 transition-all">
                  Read brief
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Article Grid ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-brand-navy">Latest Thinking</h2>
            {/* Category filter chips */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <span
                  key={cat.slug}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-default transition-colors ${
                    cat.active
                      ? "bg-brand-navy text-white"
                      : "bg-brand-light text-brand-muted hover:text-brand-navy"
                  }`}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className={`${article.categoryColor} text-white px-5 py-2.5`}>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {article.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-bold text-brand-navy text-base leading-snug group-hover:text-brand-teal transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-brand-muted text-sm leading-relaxed flex-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-brand-muted text-xs">{article.date}</span>
                    <span className="text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coming Soon + Subscribe ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">
            Launching Q3 2026
          </p>
          <h2 className="text-3xl font-bold mb-5">
            The Astellic Knowledge Engine
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            The full Insights section — with downloadable PDFs, author pages, category filtering,
            and the quarterly Implementation Brief — launches in Q3 2026.
            Sign up to be notified when the first brief publishes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded px-4 py-3 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-3 rounded transition-colors text-sm whitespace-nowrap"
            >
              Notify Me
            </Link>
          </div>
          <p className="text-gray-600 text-xs mt-4">
            No spam. Only Astellic briefs and insights — quarterly at most.
          </p>
        </div>
      </section>
    </>
  );
}
